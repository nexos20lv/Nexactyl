<?php

namespace Everest\Services\Allocations;

use IPTools\Network;
use Everest\Models\Node;
use Everest\Exceptions\DisplayException;
use Illuminate\Database\ConnectionInterface;
use Everest\Contracts\Repository\AllocationRepositoryInterface;
use Everest\Exceptions\Service\Allocation\CidrOutOfRangeException;
use Everest\Exceptions\Service\Allocation\PortOutOfRangeException;
use Everest\Exceptions\Service\Allocation\InvalidPortMappingException;
use Everest\Exceptions\Service\Allocation\TooManyPortsInRangeException;

class AssignmentService
{
    public const CIDR_MAX_BITS = 27;
    public const CIDR_MIN_BITS = 32;
    public const PORT_FLOOR = 1024;
    public const PORT_CEIL = 65535;
    public const PORT_RANGE_LIMIT = 1000;
    public const PORT_RANGE_REGEX = '/^(\d{4,5})-(\d{4,5})$/';

    /**
     * AssignmentService constructor.
     */
    public function __construct(protected AllocationRepositoryInterface $repository, protected ConnectionInterface $connection)
    {
    }

    /**
     * Insert allocations into the database and link them to a specific node.
     *
     * @throws DisplayException
     * @throws CidrOutOfRangeException
     * @throws InvalidPortMappingException
     * @throws PortOutOfRangeException
     * @throws TooManyPortsInRangeException
     */
    public function handle(Node $node, array $data): void
    {
        $allocationIp = $data['ip'];
        $explode = explode('/', $allocationIp);
        if (count($explode) !== 1) {
            if (!ctype_digit($explode[1]) || ($explode[1] > self::CIDR_MIN_BITS || $explode[1] < self::CIDR_MAX_BITS)) {
                throw new CidrOutOfRangeException();
            }
        }

        $underlying = 'Unknown IP';
        try {
            if (filter_var($allocationIp, FILTER_VALIDATE_IP)) {
                $underlying = $allocationIp;
            } else {
                $records = dns_get_record($allocationIp, DNS_A + DNS_AAAA);
                $underlying = !empty($records) ? ($records[0]['ipv6'] ?? $records[0]['ip'] ?? gethostbyname($allocationIp)) : gethostbyname($allocationIp);
            }
            $parsed = Network::parse($underlying);
        } catch (\Exception $exception) {
            throw new DisplayException("Could not parse provided allocation IP address for $allocationIp ($underlying): {$exception->getMessage()}", $exception);
        }

        $this->connection->beginTransaction();
        foreach ($parsed as $ip) {
            foreach ($data['allocation_ports'] as $port) {
                if (!is_digit($port) && !preg_match(self::PORT_RANGE_REGEX, $port)) {
                    throw new InvalidPortMappingException($port);
                }

                $insertData = [];
                if (preg_match(self::PORT_RANGE_REGEX, $port, $matches)) {
                    $block = range($matches[1], $matches[2]);

                    if (count($block) > self::PORT_RANGE_LIMIT) {
                        throw new TooManyPortsInRangeException();
                    }

                    if ((int) $matches[1] <= self::PORT_FLOOR || (int) $matches[2] > self::PORT_CEIL) {
                        throw new PortOutOfRangeException();
                    }

                    foreach ($block as $unit) {
                        $insertData[] = [
                            'node_id' => $node->id,
                            'ip' => $ip->__toString(),
                            'port' => (int) $unit,
                            'ip_alias' => array_get($data, 'alias'),
                            'server_id' => null,
                        ];
                    }
                } else {
                    if ((int) $port <= self::PORT_FLOOR || (int) $port > self::PORT_CEIL) {
                        throw new PortOutOfRangeException();
                    }

                    $insertData[] = [
                        'node_id' => $node->id,
                        'ip' => $ip->__toString(),
                        'port' => (int) $port,
                        'ip_alias' => array_get($data, 'alias'),
                        'server_id' => null,
                    ];
                }

                $this->repository->insertIgnore($insertData);
            }
        }

        $this->connection->commit();
    }
}
