import API from '../api/axios';

export const reviewService = {
  // Leave a review for a completed booking
  leaveReview: async (reviewData) => {
    const response = await API.post('reviews/leave-feedback/', reviewData);
    return response.data;
  }
};
