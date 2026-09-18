import { router } from "expo-router";
import api from "./api";
import { triggerSignOut } from "@/auth/ctx";

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.log('INTERCEPTEUR 401 :', err.response?.status);
    if (err.response?.status === 401) {
        triggerSignOut()
    }
    return Promise.reject(err);
  }
);
