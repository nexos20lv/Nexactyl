<?php

namespace Everest\Console\Commands\Billing;

use Everest\Models\Server;
use Illuminate\Console\Command;

class SuspendBillableServersCommand extends Command
{
    protected $description = 'An automated task to suspend billable servers with past renewal dates.';

    protected $signature = 'p:billing:suspend-billable-servers';

    /**
     * Handle command execution.
     */
    public function handle()
    {
        $suspension = $this->getLaravel()->make(\Everest\Services\Servers\SuspensionService::class);
        $deletion = $this->getLaravel()->make(\Everest\Services\Servers\ServerDeletionService::class);
        $renewalService = $this->getLaravel()->make(\Everest\Services\Billing\ServerRenewalService::class);
        $orderService = $this->getLaravel()->make(\Everest\Services\Billing\CreateOrderService::class);

        foreach (Server::whereNotNull('renewal_date')->with(['user'])->get() as $server) {
            $daysOverdue = $server->renewal_date->diffInDays(now());
            $threshold = config('modules.billing.renewal.threshold');

            if ($server->renewal_date->isPast()) {
                // Attempt auto-renewal if user has sufficient credits
                if ($server->billing_product_id) {
                    $product = \Everest\Models\Billing\Product::find($server->billing_product_id);
                    $owner = $server->user;

                    if (config('modules.billing.credits.enabled', true) && $product && $owner && (float) $owner->credits >= (float) $product->price && (float) $product->price > 0) {
                        $cost = (float) $product->price;
                        $owner->decrement('credits', $cost);

                        $order = $orderService->create(
                            'credit_autorenew_' . \Illuminate\Support\Str::random(16),
                            $owner,
                            $product,
                            \Everest\Models\Billing\Order::STATUS_PROCESSED,
                            \Everest\Models\Billing\Order::TYPE_RENEWAL,
                            $cost,
                            ['payment_method' => 'credits', 'auto_renew' => true]
                        );
                        $order->assignServer($server);
                        $renewalService->handle($server);

                        $this->info("Auto-renewed server {$server->id} using {$cost} credits for user {$owner->id}");
                        continue;
                    }
                }

                if (!$server->isSuspended()) {
                    $this->info("suspending server {$server->id}, overdue by {$daysOverdue} days");
                    $suspension->toggle($server, 'suspend');
                } elseif ($daysOverdue > $threshold) {
                    $this->info("deleting server {$server->id}, overdue by {$daysOverdue} days");
                    $deletion->withForce(true)->handle($server);
                }
            }
        }
    }
}
