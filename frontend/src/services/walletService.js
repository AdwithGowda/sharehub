import API from '../api/axios';

export const walletService = {
  // Retrieve wallet balance along with full transaction ledger logs
  getWalletState: async () => {
    const response = await API.get('wallet/dashboard/');
    return response.data;
  },

  // Credit test currency into user wallet for sandbox verification purposes
  simulateTestTopup: async (amount) => {
    const response = await API.post('wallet/test-topup/', { amount });
    return response.data;
  },

  // Verify and record a successful rental booking order settlement payment entry
  processBookingPayment: async (bookingId, paymentId) => {
    const response = await API.post('payments/process/', {
      booking: bookingId,
      payment_id: paymentId,
      payment_method: 'UPI/CARD_DIGITAL'
    });
    return response.data;
  },

  // File a request to withdraw funds from user wallet balance to bank account
  requestWithdrawal: async (amount, bankAccount) => {
    const response = await API.post('accounts/withdrawals/', { amount, bank_account: bankAccount });
    return response.data;
  },

  // View historical withdrawal request logs for current user
  getWithdrawalHistory: async () => {
    const response = await API.get('accounts/withdrawals/');
    return response.data;
  }
};
