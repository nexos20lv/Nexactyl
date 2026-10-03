<?php

namespace Everest\Http\Requests\Api\Application\Users;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class AdjustUserCreditsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'action' => 'required|string|in:set,add,deduct',
            'amount' => 'required|numeric|min:0',
        ];
    }

    public function permission(): string
    {
        return AdminRole::USERS_UPDATE;
    }
}
