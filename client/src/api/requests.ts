import axios from "axios";
import type { Config, FolderItem, UpdateConfig } from "../types/requests";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_PATH = "_MYSERVICE_notes/common";
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (status) => status < 400 || status == 401 || status == 403
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token)
        config.headers.Authorization = "Bearer " + token; 
    return config;
});

export async function getFiles() {
    return await getFolder("", null);
}

export async function getFile(path: string, key: string | null, onLock?: () => void) {
    const data = key === null ? null : {key: key};
    const response = await apiClient.post(`/files/${BASE_PATH}/${path}`, data);
    if (response.status === 403 && onLock) onLock();
    return response.data as string
}

export async function upsertFile(path: string, key: string | null, file: Blob) {    
    const formData = new FormData();
    if (key) formData.append("key", key);
    formData.append("file", file)
    await apiClient.put(`/files/${BASE_PATH}/${path}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data; charset=utf-8"
        }
    });
}

export async function upsertFolder(path: string, key: string | null) {    
    const formData = new FormData();
    if (key) formData.append("key", new Blob([JSON.stringify({key: key})], {type: "application/json"}));
    await apiClient.put(`/files/${BASE_PATH}/${path}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export async function deleteFile(path: string, key: string | null) {
    await apiClient.delete(`/files/${BASE_PATH}/${path}`, { data: key === null ? null : { key: key } });
}

export async function downloadZip(path: string, key: string | null) {
    const response = await apiClient.post(`/zip/${BASE_PATH}/${path}`, key === null ? null : { key: key }, { responseType: "arraybuffer" });
    return response.data
}

export async function init() {
    try {
        const formData = new FormData();
        await apiClient.put(`/files/_MYSERVICE_notes/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        await apiClient.put(`/files/_MYSERVICE_notes/common`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    } catch {
        return
    }
}

export async function getVersion() {
    const response = await apiClient.get("/version");
    return response.data as number;
}

export async function getFolder(path: string, key: string | null, onLock?: () => void) {
    const data = key === null ? null : {key: key};
    const response = await apiClient.post(`/files/${BASE_PATH}/${path}`, data);
    if (response.status === 403 && onLock) {
        onLock();
        return null;
    }
    return response.data as FolderItem[];
}

export async function getConfig() {
    const response = await apiClient.get("/config");
    if (response.status === 401) return { login: true };
    return response.data as Config;
}


export async function updateConfig(config: UpdateConfig) {
    await apiClient.put("/config", config, {
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function askAi(prompt: string, onUpdate: (token: string) => void) {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
        "Content-Type": "application/json"
    }
    if (token)
        headers["Authorization"] = "Bearer " + token;
    const response = await fetch(`${API_URL}/askai`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({prompt: prompt})
    })
    if (!response.ok || response.body === null) throw "An error occurred";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onUpdate(chunk);
    }

}

export async function askAiFile(prompt: string, path: string, key: string | null, onUpdate: (token: string) => void) {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
        "Content-Type": "application/json"
    }
    if (token)
        headers["Authorization"] = "Bearer " + token
    const response = await fetch(`${API_URL}/askai/${BASE_PATH}/${path}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({prompt: prompt, key: key})
    })
    if (!response.ok || response.body === null) throw "An error occurred";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onUpdate(chunk);
    }
}