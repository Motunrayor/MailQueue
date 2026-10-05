import api from "./api";

export const getContacts = async (options = {}) => {
  const params = {};
  const search =
    typeof options === "string" ? options : options.search || "";
  const page =
    typeof options === "object" && options.page ? options.page : undefined;
  const limit =
    typeof options === "object" && options.limit ? options.limit : undefined;

  if (search.trim()) {
    params.search = search.trim();
  }

  if (page) {
    params.page = page;
  }

  if (limit) {
    params.limit = limit;
  }

  const { data } = await api.get("/contacts", { params });

  return data;
};

export const getContactById = async (id) => {
  const { data } = await api.get(`/contacts/${id}`);

  return data;
};

export const createContact = async (contactData) => {
  const { data } = await api.post("/contacts", contactData);

  return data;
};

export const updateContact = async (id, contactData) => {
  const { data } = await api.patch(`/contacts/${id}`, contactData);

  return data;
};

export const deleteContact = async (id) => {
  const { data } = await api.delete(`/contacts/${id}`);

  return data;
};
