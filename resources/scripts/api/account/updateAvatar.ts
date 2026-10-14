import http from '@/api/http';

export const updateAccountAvatarFile = (file: File): Promise<{ avatarUrl: string | null; image: string }> => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('avatar', file);

        http.post('/api/client/account/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) =>
                resolve({
                    avatarUrl: response.data.avatar_url,
                    image: response.data.image,
                })
            )
            .catch(reject);
    });
};

export const updateAccountAvatarUrl = (url: string): Promise<{ avatarUrl: string | null; image: string }> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/avatar', { avatar_url: url })
            .then((response) =>
                resolve({
                    avatarUrl: response.data.avatar_url,
                    image: response.data.image,
                })
            )
            .catch(reject);
    });
};

export const deleteAccountAvatar = (): Promise<{ avatarUrl: null; image: string }> => {
    return new Promise((resolve, reject) => {
        http.delete('/api/client/account/avatar')
            .then((response) =>
                resolve({
                    avatarUrl: null,
                    image: response.data.image,
                })
            )
            .catch(reject);
    });
};
