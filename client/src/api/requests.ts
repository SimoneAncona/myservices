import axios from "axios";
import type { Config, FolderItem } from "../types/requests";

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