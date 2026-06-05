import API from '../api/axios';

export const bookingService = {
  // File an initial reservation application proposal
  createBooking: async (bookingData) => {
    const response = await API.post('bookings/', bookingData);
    return response.data;
  },

  // View user-related rental histories (both as Renter and Owner streams)
  getUserBookings: async () => {
    const response = await API.get('bookings/');
    return response.data;
  },

  // Fire workflow state transition flags (APPROVE, REJECT, CANCEL, COMPLETE)
  triggerBookingAction: async (id, action) => {
    const response = await API.patch(`bookings/${id}/action/`, { action });
    return response.data;
  },

  // Upload return inspection photos (optional for renter/owner)
  uploadReturnEvidence: async (id, formData) => {
    const response = await API.post(`bookings/${id}/upload-return/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
