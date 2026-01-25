import api from "./api";

export const propertyService = {
  // Get all properties with filters
  getProperties: async (params = {}) => {
    const response = await api.get("/properties", { params });
    return response.data;
  },

  // Get single property
  getProperty: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Create property (owner only)
  createProperty: async (propertyData) => {
    const response = await api.post("/properties", propertyData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update property (owner only, draft only)
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Delete property (soft delete)
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Publish property (owner only)
  publishProperty: async (id) => {
    const response = await api.put(`/properties/${id}/publish`);
    return response.data;
  },

  // Get owner's properties
  getMyProperties: async (status = "") => {
    const params = status ? { status } : {};
    const response = await api.get("/properties/my-properties/all", { params });
    return response.data;
  },
};

export const favoriteService = {
  addFavorite: async (propertyId) => {
    const response = await api.post(`/favorites/${propertyId}`);
    return response.data;
  },

  removeFavorite: async (propertyId) => {
    const response = await api.delete(`/favorites/${propertyId}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get("/favorites");
    return response.data;
  },

  checkFavorite: async (propertyId) => {
    const response = await api.get(`/favorites/check/${propertyId}`);
    return response.data;
  },
};

export const adminService = {
  getMetrics: async () => {
    const response = await api.get("/admin/metrics");
    return response.data;
  },

  toggleProperty: async (id, action) => {
    const response = await api.put(`/admin/properties/${id}/toggle`, {
      action,
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  getAllProperties: async () => {
    const response = await api.get("/admin/properties");
    return response.data;
  },
};
