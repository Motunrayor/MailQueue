
import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });
  return response.data;
};

export const getAdminCampaigns = async (params = {}) => {
  const response = await api.get("/admin/campaigns", {
    params,
  });
  return response.data;
};

