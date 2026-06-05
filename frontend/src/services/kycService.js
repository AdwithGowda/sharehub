import API from '../api/axios';

export const kycService = {
  // Check the current user's compliance status
  getKYCStatus: async () => {
    const response = await API.get('kyc/submit/');
    return response.data;
  },

  // Stream compliance documents to Django storage layers
  submitKYCDocuments: async (formData) => {
    const response = await API.post('kyc/submit/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Essential for handling file objects
      },
    });
    return response.data;
  }
};
