import API from '../api/axios';

export const platformService = {
  getSettings: async () => {
    const response = await API.get('core/platform-settings/');
    return response.data;
  }
};
