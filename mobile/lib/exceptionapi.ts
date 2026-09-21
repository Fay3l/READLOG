import { router } from "expo-router";
import api from "./api";
import { useSession } from "@/auth/ctx";

const {signOut}= useSession()

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.log('INTERCEPTEUR 401 :', err.response?.status);
    if (err.response?.status === 401) {
      console.log("SIGN OUT")
      signOut()
      console.log("SIGN OUT --2 ")
    }
    return Promise.reject(err);
  }
);
