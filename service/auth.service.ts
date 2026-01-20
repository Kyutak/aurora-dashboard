import { api } from "./api";

export const authService = {
  register(name: string, email: string, password: string) {
    return api.post("/auth/register", { name, email, password });
  },

  login(email: string, password: string) {
    return api.post("/auth/login", {
      email,
      password,
    });
  },


  resendOTP(email: string) {
    return api.post("/auth/resend-otp", { email });
  },
};
