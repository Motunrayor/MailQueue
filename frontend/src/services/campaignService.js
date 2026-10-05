import api from "./api";

// Get all campaigns
export const getCampaigns = async (params = {}) => {
  const { data } = await api.get("/campaigns", { params });
  return data;
};

// Get one campaign
export const getCampaignById = async (id) => {
  const { data } = await api.get(`/campaigns/${id}`);
  return data;
};

// Create campaign
export const createCampaign = async (campaignData) => {
  const { data } = await api.post("/campaigns", campaignData);
  return data;
};

// Update campaign
export const updateCampaign = async (id, campaignData) => {
  const { data } = await api.patch(
    `/campaigns/${id}`,
    campaignData
  );

  return data;
};

// Delete campaign
export const deleteCampaign = async (id) => {
  const { data } = await api.delete(`/campaigns/${id}`);
  return data;
};

// Send campaign
export const sendCampaign = async (id) => {
  const { data } = await api.post(`/campaigns/${id}/send`);
  return data;
};

// Get campaign notifications
export const getCampaignNotifications = async (id) => {
  const { data } = await api.get(
    `/campaigns/${id}/notifications`
  );

  return data;
};
