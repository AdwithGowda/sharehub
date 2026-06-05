import API from '../api/axios';

export const chatService = {
  // Retrieve message logs for a specific booking thread
  getChatThread: async (bookingId) => {
    const response = await API.get(`chat/thread/${bookingId}/`);
    return response.data;
  },

  // Post a text message into the booking thread
  sendMessage: async (bookingId, messageText) => {
    const response = await API.post(`chat/thread/${bookingId}/`, { message: messageText });
    return response.data;
  },

  // Upload verification photos during pickup handover (flips status to ACTIVE)
  submitPickupHandover: async (bookingId, formData) => {
    const response = await API.post(`bookings/${bookingId}/verify-pickup/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
