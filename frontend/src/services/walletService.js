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

  // Create a Razorpay Order for wallet topup
  createTopupOrder: async (amount) => {
    const response = await API.post('wallet/create-topup-order/', { amount });
    return response.data;
  },

  // Verify wallet topup payment signature
  verifyTopupPayment: async (payload) => {
    const response = await API.post('wallet/test-topup/', payload);
    return response.data;
  },

  // Create a Razorpay Order for a rental booking
  createRazorpayOrder: async (bookingId) => {
    const response = await API.post('payments/create-order/', { booking: bookingId });
    return response.data;
  },

  // Verify and record a successful rental booking order settlement payment entry
  processBookingPayment: async (bookingIdOrPayload, paymentId = null, orderId = null, signature = null) => {
    let payload = {};
    if (typeof bookingIdOrPayload === 'object' && bookingIdOrPayload !== null) {
      payload = bookingIdOrPayload;
    } else {
      payload = {
        booking: bookingIdOrPayload,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        payment_method: 'UPI/CARD_DIGITAL'
      };
    }
    const response = await API.post('payments/process/', payload);
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
