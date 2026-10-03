<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\User;
use Everest\Models\Server;
use Illuminate\Support\Str;
use Everest\Models\Billing\Order;
use Illuminate\Support\Facades\DB;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Billing\UpgradeService;
use Everest\Services\Billing\CreateOrderService;
use Everest\Transformers\Api\Client\ProductTransformer;
use Everest\Transformers\Api\Client\ServerTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Http\Requests\Api\Client\Billing\ProcessUpgradeRequest;
use Everest\Http\Requests\Api\Client\Billing\GetUpgradeChargeRequest;
use Everest\Http\Requests\Api\Client\Billing\GetUpgradeOptionsRequest;

class UpgradeController extends ClientApiController
{
    public function __construct(
        private UpgradeService $upgradeService,
        private CreateOrderService $orderService,
    ) {
        parent::__construct();
    }

    /**
     * Returns all available products to upgrade to.
     */
    public function index(GetUpgradeOptionsRequest $request, Server $server): array
    {
        $existing_product = Product::findOrFail($server->billing_product_id);

        $products = Product::where('category_uuid', $existing_product->category->uuid)
            ->where('price', '>', $existing_product->price)
            ->get();

        return $this->transform($products, ProductTransformer::class);
    }

    /**
     * Generate an OTC for the pro-rated server upgrade.
     */
    public function charge(GetUpgradeChargeRequest $request, Server $server): array
    {
        $existing_product = Product::findOrFail($server->billing_product_id);
        $new_product = Product::findOrFail($request->input('product_id'));

        if ($existing_product->price >= $new_product->price) {
            throw new DisplayException('You cannot upgrade to a cheaper plan.');
        }

        $charge = $this->upgradeService->charge($server, $existing_product, $new_product);

        return ['charge' => $charge];
    }

    /**
     * Process a one-time upgrade fee through user credits and
     * update the server with new resources according to new package.
     */
    public function create(ProcessUpgradeRequest $request, Server $server): array
    {
        if (!config('modules.billing.credits.enabled', true)) {
            throw new DisplayException('Le système de paiement par crédits est actuellement désactivé.');
        }

        $user = $request->user();
        if ($server->owner_id !== $user->id) {
            throw new DisplayException('You are not authorized to upgrade this server.');
        }

        $validated = $this->upgradeService->validate($user);

        if (!$validated) {
            throw new DisplayException('This server cannot be upgraded at this time.');
        }

        $existing_product = Product::findOrFail($server->billing_product_id);
        $new_product = Product::findOrFail($request->input('product_id'));
        $price = (float) $this->upgradeService->charge($server, $existing_product, $new_product);

        if ($existing_product->price >= $new_product->price) {
            throw new DisplayException('You cannot upgrade to a cheaper plan.');
        }

        if ($price > 0 && (float) $user->credits < $price) {
            $formattedUser = number_format((float) $user->credits, 2);
            $formattedPrice = number_format($price, 2);
            throw new DisplayException("Solde insuffisant pour la mise à niveau ({$formattedPrice} crédits requis, solde actuel : {$formattedUser} crédits).");
        }

        DB::transaction(function () use ($user, $server, $new_product, $price) {
            if ($price > 0) {
                /** @var User $lockedUser */
                $lockedUser = User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();
                if ((float) $lockedUser->credits < $price) {
                    throw new DisplayException('Solde insuffisant pour effectuer la mise à niveau.');
                }
                $lockedUser->decrement('credits', $price);
            }

            $order = $this->orderService->create(
                'credit_upg_' . Str::random(16),
                $user,
                $new_product,
                Order::STATUS_PROCESSED,
                Order::TYPE_UPGRADE,
                $price,
                ['payment_method' => 'credits']
            );

            $order->assignServer($server);
            $this->upgradeService->handle($server, $new_product);
        });

        return [
            'success' => true,
            'url' => '/server/' . $server->uuid . '/billing',
            'server' => $this->transform($server->refresh(), ServerTransformer::class),
        ];
    }
}
