<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Auth\AuthManager;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Facades\Activity;
use Illuminate\Support\Facades\RateLimiter;
use Pterodactyl\Services\Users\UserUpdateService;
use Pterodactyl\Transformers\Api\Client\AccountTransformer;
use Pterodactyl\Http\Requests\Api\Client\Account\UpdateEmailRequest;
use Pterodactyl\Http\Requests\Api\Client\Account\UpdatePasswordRequest;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class AccountController extends ClientApiController
{
    /**
     * The number of seconds that must elapse before the email change throttle resets.
     */
    private const EMAIL_UPDATE_THROTTLE = 60 * 60 * 24;

    /**
     * AccountController constructor.
     */
    public function __construct(private AuthManager $manager, private UserUpdateService $updateService)
    {
        parent::__construct();
    }

    public function index(Request $request): array
    {
        return $this->fractal->item($request->user())
            ->transformWith($this->getTransformer(AccountTransformer::class))
            ->toArray();
    }

    /**
     * Update the authenticated user's email address.
     */
    public function updateEmail(UpdateEmailRequest $request): JsonResponse
    {
        $user = $request->user();
        // Only allow a user to change their email three times in the span
        // of 24 hours. This prevents malicious users from trying to find
        // existing accounts in the system by constantly changing their email.
        if (RateLimiter::tooManyAttempts($key = "user:update-email:{$user->uuid}", 3)) {
            throw new TooManyRequestsHttpException(message: 'Your email address has been changed too many times today. Please try again later.');
        }

        $original = $user->email;
        if (mb_strtolower($original) !== mb_strtolower($request->validated('email'))) {
            RateLimiter::hit($key, self::EMAIL_UPDATE_THROTTLE);

            $this->updateService->handle($user, $request->validated());

            Activity::event('user:account.email-changed')
                ->property(['old' => $original, 'new' => $request->validated('email')])
                ->log();
        }

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    /**
     * Update the authenticated user's password. All existing sessions will be logged
     * out immediately.
     *
     * @throws \Throwable
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = Activity::event('user:account.password-changed')->transaction(function () use ($request) {
            return $this->updateService->handle($request->user(), $request->validated());
        });

        $guard = $this->manager->guard();
        // If you do not update the user in the session you'll end up working with a
        // cached copy of the user that does not include the updated password. Do this
        // to correctly store the new user details in the guard and allow the logout
        // other devices functionality to work.
        $guard->setUser($user);

        // This method doesn't exist in the stateless Sanctum world.
        if (method_exists($guard, 'logoutOtherDevices')) { // @phpstan-ignore function.alreadyNarrowedType
            $guard->logoutOtherDevices($request->input('password'));
        }

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    /**
     * Update the authenticated user's avatar (custom image file or URL).
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => 'required|file|image|mimes:jpeg,jpg,png,webp,gif|max:5120',
            ]);

            $file = $request->file('avatar');
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $filename = sprintf('avatar_%d_%d_%s.%s', $user->id, time(), \Illuminate\Support\Str::random(8), strtolower($extension));

            // Ensure avatars directory exists in public storage
            if (!\Illuminate\Support\Facades\Storage::disk('public')->exists('avatars')) {
                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('avatars');
            }

            // Delete old uploaded avatar if it was stored locally
            if ($user->avatar_url && \Illuminate\Support\Str::startsWith($user->avatar_url, '/storage/avatars/')) {
                $oldFile = str_replace('/storage/avatars/', 'avatars/', $user->avatar_url);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldFile)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldFile);
                }
            }

            // Store new file
            $file->storeAs('avatars', $filename, 'public');

            $user->avatar_url = '/storage/avatars/' . $filename;
            $user->save();
        } elseif ($request->has('avatar_url')) {
            $request->validate([
                'avatar_url' => 'required|string|url|max:1024',
            ]);

            $url = $request->input('avatar_url');
            if (!filter_var($url, FILTER_VALIDATE_URL) || (!\Illuminate\Support\Str::startsWith($url, 'https://') && !\Illuminate\Support\Str::startsWith($url, 'http://'))) {
                return new JsonResponse(['error' => 'L\'URL fournie est invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // Delete old uploaded avatar if it was stored locally
            if ($user->avatar_url && \Illuminate\Support\Str::startsWith($user->avatar_url, '/storage/avatars/')) {
                $oldFile = str_replace('/storage/avatars/', 'avatars/', $user->avatar_url);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldFile)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldFile);
                }
            }

            $user->avatar_url = $url;
            $user->save();
        } else {
            return new JsonResponse(['error' => 'Veuillez fournir un fichier image ou une URL valide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        Activity::event('user:account.avatar-changed')
            ->subject($user)
            ->property(['avatar_url' => $user->avatar_url])
            ->log('mise à jour de la photo de profil');

        return new JsonResponse([
            'avatar_url' => $user->avatar_url,
            'image' => $user->avatar_url ?: ('https://gravatar.com/avatar/' . md5(\Illuminate\Support\Str::lower($user->email))),
        ]);
    }

    /**
     * Remove the authenticated user's avatar.
     */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar_url && \Illuminate\Support\Str::startsWith($user->avatar_url, '/storage/avatars/')) {
            $oldFile = str_replace('/storage/avatars/', 'avatars/', $user->avatar_url);
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldFile)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldFile);
            }
        }

        $user->avatar_url = null;
        $user->save();

        Activity::event('user:account.avatar-removed')
            ->subject($user)
            ->log('suppression de la photo de profil');

        return new JsonResponse([
            'avatar_url' => null,
            'image' => 'https://gravatar.com/avatar/' . md5(\Illuminate\Support\Str::lower($user->email)),
        ]);
    }
}
