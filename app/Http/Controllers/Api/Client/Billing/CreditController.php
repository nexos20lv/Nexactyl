<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Egg;
use Everest\Models\Node;
use Everest\Models\User;
use Everest\Models\Server;
use Illuminate\Support\Str;
use Everest\Models\Billing\Order;
use Illuminate\Support\Facades\DB;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Models\Billing\DiscountCode;
use Everest\Models\Billing\BillingException;
use Everest\Services\Billing\DiscountService;
use Everest\Services\Billing\CreateOrderService;
use Everest\Services\Billing\ServerRenewalService;
use Everest\Services\Billing\ServerDeploymentService;
use Everest\Transformers\Api\Client\ServerTransformer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Http\Requests\Api\Client\Billing\ProcessCreditPaymentRequest;

class CreditController extends ClientApiController
{
    public function __construct(
        private DiscountService $discountService,
        private CreateOrderService $orderService,
        private ServerRenewalService $renewalService,
        private ServerDeploymentService $deploymentService,
    ) {
        parent::__construct();
    }

    /**
     * Process a new server purchase or server renewal using the user's credits balance.
     */
    public function process(ProcessCreditPaymentRequest $request): array
    {
        if (!config('modules.billing.credits.enabled', true)) {
            throw new DisplayException('Le système de paiement par crédits est actuellement désactivé.');
        }

        $user = $request->user();
        $serverId = $request->input('server_id');
        $product = Product::findOrFail($request->input('product_id'));

        if ($serverId) {
            return $this->handleRenewal($user, $product, $serverId);
        }

        return $this->handleNewDeployment($request, $user, $product);
    }

    /**
     * Handle renewal of an existing server using credits.
     */
    protected function handleRenewal(User $user, Product $product, int $serverId): array
    {
        try {
            $server = $user->servers()->where('id', $serverId)->firstOrFail();
        } catch (ModelNotFoundException $e) {
            throw new DisplayException('Ce serveur n\'existe pas ou ne vous appartient pas.');
        }

        $cost = (float) $product->price;

        if ((float) $user->credits < $cost) {
            $formattedUser = number_format((float) $user->credits, 2);
            $formattedCost = number_format($cost, 2);
            throw new DisplayException("Solde insuffisant pour renouveler le serveur ({$formattedCost} crédits requis, solde actuel : {$formattedUser} crédits). Veuillez contacter un administrateur.");
        }

        $order = null;

        try {
            $server = DB::transaction(function () use ($user, $product, $server, $cost, &$order) {
                /** @var User $lockedUser */
                $lockedUser = User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();

                if ((float) $lockedUser->credits < $cost) {
                    throw new DisplayException("Solde insuffisant pour effectuer le renouvellement.");
                }

                $lockedUser->decrement('credits', $cost);

                $order = $this->orderService->create(
                    'credit_renew_' . Str::random(16),
                    $lockedUser,
                    $product,
                    Order::STATUS_PENDING,
                    Order::TYPE_RENEWAL,
                    $cost,
                    ['payment_method' => 'credits']
                );
                $order->assignServer($server);

                $updatedServer = $this->renewalService->handle($server);
                $order->setStatus(Order::STATUS_PROCESSED);

                return $updatedServer;
            });
        } catch (DisplayException $e) {
            if ($order && $order->status !== Order::STATUS_PROCESSED) {
                $order->setStatus(Order::STATUS_FAILED);
                $user->increment('credits', $cost);

                BillingException::create([
                    'order_id' => $order->id,
                    'exception_type' => BillingException::TYPE_DEPLOYMENT,
                    'title' => 'Renouvellement du serveur échoué',
                    'description' => $e->getMessage(),
                ]);
            }
            throw $e;
        }

        return $this->transform($server, ServerTransformer::class);
    }

    /**
     * Handle deployment of a new server using credits.
     */
    protected function handleNewDeployment(ProcessCreditPaymentRequest $request, User $user, Product $product): array
    {
        $nodeId = $request->input('node_id');
        if (!$nodeId) {
            throw new DisplayException('Un noeud doit être sélectionné pour déployer le serveur.');
        }

        $node = Node::findOrFail($nodeId);
        if (!$node->deployable) {
            throw new DisplayException('Les serveurs ne peuvent pas être déployés sur ce noeud.');
        }

        $deploymentFee = (float) ($node->deployment_fee ?? 0);
        $eggId = $this->resolveEggSelection($product, $request->input('egg_id'));

        $discountCode = $request->input('discount_code');
        $price = null;
        if ($request->filled('discount_code')) {
            $price = $this->discountService->handle($product, $discountCode);
        }

        $cost = ($price !== null ? (float) $price : (float) $product->price) + $deploymentFee;

        if ((float) $user->credits < $cost) {
            $formattedUser = number_format((float) $user->credits, 2);
            $formattedCost = number_format($cost, 2);
            throw new DisplayException("Solde insuffisant pour créer ce serveur ({$formattedCost} crédits requis, solde actuel : {$formattedUser} crédits). Veuillez contacter un administrateur.");
        }

        $metadata = [
            'user_id' => (string) $user->id,
            'customer_email' => $user->email,
            'product_id' => (string) $product->id,
            'node_id' => (string) $node->id,
            'server_id' => '0',
            'egg_id' => (string) ($eggId ?? ''),
            'variables' => json_encode($request->input('variables') ?? []),
            'order_type' => Order::TYPE_NEW,
            'discount_code' => $discountCode,
        ];

        $orderMetadata = array_filter([
            'deployment_fee' => $deploymentFee > 0 ? $deploymentFee : null,
            'discount_code' => $price !== null ? $discountCode : null,
            'subtotal' => $price !== null ? $product->price : null,
            'payment_method' => 'credits',
        ], fn ($v) => $v !== null) ?: null;

        $order = null;

        try {
            $order = DB::transaction(function () use ($user, $product, $cost, $price, $orderMetadata, $discountCode) {
                /** @var User $lockedUser */
                $lockedUser = User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();

                if ((float) $lockedUser->credits < $cost) {
                    throw new DisplayException("Solde insuffisant pour créer ce serveur.");
                }

                $lockedUser->decrement('credits', $cost);

                $order = $this->orderService->create(
                    'credit_new_' . Str::random(16),
                    $lockedUser,
                    $product,
                    Order::STATUS_PENDING,
                    Order::TYPE_NEW,
                    $price,
                    $orderMetadata
                );

                if (!empty($discountCode)) {
                    $dc = DiscountCode::where('code', $discountCode)->lockForUpdate()->first();
                    if ($dc && $dc->isValid()) {
                        $dc->use();
                    }
                }

                return $order;
            });

            $server = $this->deploymentService->handle($user, $product, $metadata, $order);
            $order->assignServer($server);
            $order->setStatus(Order::STATUS_PROCESSED);
        } catch (DisplayException $e) {
            if ($order && $order->status !== Order::STATUS_PROCESSED) {
                $order->setStatus(Order::STATUS_FAILED);
                // Refund deducted credits
                $user->increment('credits', $cost);

                BillingException::create([
                    'order_id' => $order->id,
                    'exception_type' => BillingException::TYPE_DEPLOYMENT,
                    'title' => 'Déploiement du serveur échoué',
                    'description' => $e->getMessage(),
                ]);
            }
            throw $e;
        }

        return $this->transform($server, ServerTransformer::class);
    }

    /**
     * Resolve egg selection for product.
     */
    protected function resolveEggSelection(Product $product, mixed $submittedEggId): ?int
    {
        if ($product->category->egg_id) {
            return null;
        }

        if (!$submittedEggId) {
            throw new DisplayException('Un egg doit être sélectionné pour déployer ce produit.');
        }

        $egg = Egg::findOrFail($submittedEggId);

        if ((int) $egg->nest_id !== (int) $product->category->nest_id) {
            throw new DisplayException('L\'egg sélectionné n\'appartient pas au nest de ce produit.');
        }

        return $egg->id;
    }
}
