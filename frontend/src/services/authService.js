import api from "./api";

export const registerUser = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const requestPasswordReset = async (email) => {
  const { data } = await api.post("/auth/forget-password", { email });
  return data;
};

export const resetPassword = async ({
  email,
  otp_code,
  newPassword,
  confirmPassword,
}) => {
  const { data } = await api.patch("/auth/change-password", {
    email,
    otp_code,
    newPassword,
    confirmPassword,
  });
  return data;
};