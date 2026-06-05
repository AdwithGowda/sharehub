import API from '../api/axios';

export const disputeService = {
  // Raise a damage claim dispute with description, repair cost, and photos
  raiseDamageClaim: async (formData) => {
    const response = await API.post('disputes/raise/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
