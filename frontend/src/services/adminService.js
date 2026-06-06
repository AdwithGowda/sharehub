import API from '../api/axios';

export const adminService = {
  // --- KYC Compliance Endpoints ---
  getPendingKYCs: async () => {
    const response = await API.get('kyc/admin/review/');
    return response.data;
  },

  updateKYCStatus: async (id, action) => {
    // action expects: 'APPROVE' or 'REJECT'
    const response = await API.patch(`kyc/admin/review/${id}/`, { action });
    return response.data;
  },

  // --- Dispute Arbitration Endpoints ---
  getDamageClaims: async () => {
    const response = await API.get('disputes/admin/claims/');
    return response.data;
  },

  resolveDamageDispute: async (id, action, adminNotes, repairCost) => {
    // action expects: 'RESOLVE' (triggers Rahul/Adwith deposit split) or 'REJECT'
    const response = await API.patch(`disputes/admin/resolve/${id}/`, {
      action,
      admin_notes: adminNotes,
      repair_cost: repairCost
    });
    return response.data;
  },

  // --- User Management Endpoints ---
  getUsers: async () => {
    const response = await API.get('accounts/admin/users/');
    return response.data;
  },

  toggleUserActive: async (id) => {
    const response = await API.patch(`accounts/admin/users/${id}/toggle/`);
    return response.data;
  },

  // --- Item Moderation Endpoints ---
  getItems: async () => {
    const response = await API.get('items/admin/items/');
    return response.data;
  },

  getCategories: async () => {
    const response = await API.get('items/categories/');
    return response.data;
  },

  createCategory: async (name, description, imageFile) => {
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);

    const response = await API.post('items/categories/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await API.delete(`items/admin/categories/${id}/`);
    return response.data;
  },

  removeItem: async (id) => {
    const response = await API.delete(`items/admin/items/${id}/`);
    return response.data;
  },

  // --- Booking Monitoring Endpoints ---
  getBookings: async () => {
    const response = await API.get('bookings/');
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await API.patch(`bookings/${id}/action/`, { action: 'CANCEL' });
    return response.data;
  },

  updateBookingStatus: async (id, action) => {
    const response = await API.patch(`bookings/${id}/action/`, { action });
    return response.data;
  },

  // --- Analytics Dashboard Endpoints ---
  getAnalytics: async () => {
    const response = await API.get('accounts/admin/analytics/');
    return response.data;
  },

  // --- Platform Settings Endpoints ---
  getPlatformSettings: async () => {
    const response = await API.get('core/platform-settings/');
    return response.data;
  },

  updatePlatformSettings: async (settings) => {
    const response = await API.patch('core/platform-settings/', settings);
    return response.data;
  },

  // --- Notification Broadcast Endpoints ---
  broadcastNotification: async (title, message) => {
    const response = await API.post('notifications/admin/broadcast/', { title, message });
    return response.data;
  },

  getNotificationHistory: async () => {
    const response = await API.get('notifications/admin/broadcast/');
    return response.data;
  },

  // --- Withdrawal Management Endpoints ---
  getWithdrawalRequests: async () => {
    const response = await API.get('accounts/withdrawals/');
    return response.data;
  },

  updateWithdrawalStatus: async (id, action) => {
    // action expects: 'APPROVE' or 'REJECT'
    const response = await API.patch(`accounts/withdrawals/${id}/`, { action });
    return response.data;
  },

  // --- Wallet Management Endpoints ---
  getWallets: async () => {
    const response = await API.get('wallet/admin/wallets/');
    return response.data;
  },

  adjustWallet: async (id, action, amount) => {
    const response = await API.post(`wallet/admin/wallets/${id}/adjust/`, { action, amount });
    return response.data;
  },

  getPayments: async () => {
    const response = await API.get('payments/');
    return response.data;
  },

  getChatThreads: async (search = '', disputeOnly = false) => {
    const response = await API.get('chat/admin/threads/', {
      params: { search, dispute_only: disputeOnly }
    });
    return response.data;
  },

  getChatMessages: async (bookingId) => {
    const response = await API.get(`chat/thread/${bookingId}/`);
    return response.data;
  },

  getReviews: async () => {
    const response = await API.get('reviews/admin/');
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await API.delete(`reviews/admin/${id}/`);
    return response.data;
  }
};
