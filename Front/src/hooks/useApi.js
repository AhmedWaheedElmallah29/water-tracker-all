import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

export function useApi() {
  const { getToken } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BASE_URL });

    // Inject Clerk's session token as Bearer on every request
    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return api;
}
