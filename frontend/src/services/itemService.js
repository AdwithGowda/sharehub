import API from '../api/axios';

export const itemService = {
  // Fetch active listings with optional filter sorting (category, location, max price)
  getActiveItems: async (filters = {}) => {
    const response = await API.get('items/', { params: filters });
    return response.data;
  },

  // Fetch all predefined administrative item categories
  getCategories: async () => {
    const response = await API.get('items/categories/');
    return response.data;
  },

  // Retrieve single item listing specs
  getItemDetail: async (id) => {
    const response = await API.get(`items/${id}/`);
    return response.data;
  },

  uploadNewItem: async (formData) => {
    const response = await API.post('items/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await API.delete(`items/${id}/`);
    return response.data;
  }
};
