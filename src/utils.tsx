export function statusOk(status: number) {
    return 200 <= status && status < 300;
}

const API_URL = import.meta.env.VITE_API_URL;

export function getApiUrl() {
    return API_URL;
}
