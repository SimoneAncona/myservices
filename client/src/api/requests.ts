import axios from "axios";
import type { Config, FolderItem } from "../models/requests";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_PATH = "_MYSERVICE_notes/common";
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (status) => status < 400 || status == 401
});

export async function getFiles() {
    return await getFolder("", null);
}

export async function getFile(path: string, key: string | null) {
    const data = key === null ? null : {key: key};
    const response = await apiClient.post(`/files/${BASE_PATH}/${path}`, data);
    return response.data
}

export async function upsertFile(path: string, key: string | null, file: Blob) {    
    const formData = new FormData();
    if (key) formData.append("key", key);
    formData.append("file", file)
    await apiClient.put(`/files/${BASE_PATH}/${path}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export async function upsertFolder(path: string, key: string | null) {    
    const formData = new FormData();
    if (key) formData.append("key", key);
    await apiClient.put(`/files/${BASE_PATH}/${path}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
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

export async function getFolder(path: string, key: string | null) {
    const data = key === null ? null : {key: key};
    const response = await apiClient.post(`/files/${BASE_PATH}/${path}`, data);
    return response.data as FolderItem[];
}

export async function getConfig() {
    const response = await apiClient.get("/config");
    if (response.status === 401) return { login: true };
    return response.data as Config;
}