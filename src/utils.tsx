import type { AxiosError } from "axios";

export function formatError(res: AxiosError) {
    const messages = (res.response!.data! as Record<string, unknown>).message as Array<string> | string;
    if (typeof messages == 'string')
        alert(messages);
    else
        alert(messages.join('\n'));
}

export const API_URL = import.meta.env.VITE_API_URL;
