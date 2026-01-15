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

  verifyOTP(email: string, code: string) {
    return api.post(
      "/auth/verify",
      { email, code },
      { withCredentials: true }
    );
  },

  resendOTP(email: string) {
    return api.post("/auth/resend-otp", { email });
  },
};
