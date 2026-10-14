import http from '@/api/http';

export interface MinecraftProperties {
    [key: string]: any;
}

export interface PlayerInfo {
    name: string;
    id?: string | null;
}

export interface OpInfo {
    uuid: string;
    name: string;
    level?: number;
    bypassesPlayerLimit?: boolean;
}

export interface WhitelistInfo {
    uuid: string;
    name: string;
}

export interface BannedPlayerInfo {
    uuid: string;
    name: string;
    created?: string;
    source?: string;
    expires?: string;
    reason?: string;
}

export interface MinecraftPlayersResponse {
    online: PlayerInfo[];
    online_count: number;
    max_players: number;
    server_online: boolean;
    version?: string | null;
    motd?: string | null;
    ops: OpInfo[];
    whitelist: WhitelistInfo[];
    banned: BannedPlayerInfo[];
}

export interface SubdomainResponse {
    subdomain: {
        id: number;
        server_id: number;
        subdomain: string;
        domain: string;
        port: number;
        target: string;
        status: string;
    } | null;
    available_domains: string[];
    allocation: {
        ip: string;
        port: number;
    } | null;
    cloudflare_configured: boolean;
}

export const getServerMinecraftConfig = (uuid: string): Promise<MinecraftProperties> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/minecraft/config`)
            .then(({ data }) => resolve(data.properties || {}))
            .catch(reject);
    });
};

export const updateServerMinecraftConfig = (
    uuid: string,
    properties: MinecraftProperties
): Promise<MinecraftProperties> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/minecraft/config`, { properties })
            .then(({ data }) => resolve(data.properties || {}))
            .catch(reject);
    });
};

export const getServerMinecraftPlayers = (uuid: string): Promise<MinecraftPlayersResponse> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/minecraft/players`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const executeMinecraftPlayerAction = (
    uuid: string,
    payload: {
        action:
            | 'op'
            | 'deop'
            | 'kick'
            | 'ban'
            | 'pardon'
            | 'whitelist_add'
            | 'whitelist_remove'
            | 'teleport'
            | 'gamemode'
            | 'whisper'
            | 'kill';
        player: string;
        reason?: string;
        target?: string;
        gamemode?: 'survival' | 'creative' | 'adventure' | 'spectator';
        message?: string;
    }
): Promise<{ success: boolean; command: string; message: string }> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/minecraft/players/action`, payload)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const getServerSubdomain = (uuid: string): Promise<SubdomainResponse> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/subdomain`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const updateServerSubdomain = (
    uuid: string,
    subdomain: string,
    domain?: string
): Promise<{ success: boolean; full_domain: string; message: string; subdomain: any }> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/subdomain`, { subdomain, domain })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const deleteServerSubdomain = (uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/subdomain`)
            .then(() => resolve())
            .catch(reject);
    });
};
