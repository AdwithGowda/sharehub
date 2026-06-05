import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatService } from '../../services/chatService';
import { bookingService } from '../../services/bookingService';
import { disputeService } from '../../services/disputeService';
import { reviewService } from '../../services/reviewService';
import { AuthContext } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import PaymentCard from '../../components/booking/PaymentCard';
import API from '../../api/axios';

export default function BookingDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Handover File & Token States
  const [qrToken, setQrToken] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Return States
  const [returnFiles, setReturnFiles] = useState([]);
  const [uploadingReturn, setUploadingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState('');

  // Dispute States
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeDesc, setDisputeDesc] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [disputePhotos, setDisputePhotos] = useState([]);
  const [raisingDispute, setRaisingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState('');

  // Review States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    loadBookingHubData();
    
    // Poll for new messages every 4 seconds to simulate real-time text triggers
    const messagePollingInterval = setInterval(loadChatMessages, 4000);
    return () => clearInterval(messagePollingInterval);
  }, [id]);

  useEffect(() => {
    // Automatically scroll down to the newest text bubble when logs update
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadBookingHubData = async () => {
    try {
      setLoading(true);
      // Fetch the specific booking directly from our core API list
      const res = await API.get(`bookings/`);
      const currentBooking = res.data.find(b => b.id === parseInt(id));
      setBooking(currentBooking);
      
      if (currentBooking) {
        const chatLogs = await chatService.getChatThread(id);
        setMessages(chatLogs);
      }
    } catch (err) {
      console.error("Error loading coordination terminal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const chatLogs = await chatService.getChatThread(id);
      setMessages(chatLogs);
    } catch (err) {
      console.error("Silent chat refresh failed.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const sentMsg = await chatService.sendMessage(id, newMessage.trim());
      setMessages([...messages, sentMsg]);
      setNewMessage('');
    } catch (err) {
      alert("Could not transmit message.");
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
    setUploadError('');
  };

  const handleHandoverSubmit = async (e) => {
    e.preventDefault();
    if (!qrToken.trim()) {
      setUploadError("Please enter the renter's pickup QR token.");
      return;
    }
    if (selectedFiles.length === 0) {
      setUploadError("Please choose at least one item verification photo.");
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      
      const payload = new FormData();
      selectedFiles.forEach(file => {
        payload.append('handover_images', file);
      });
      payload.append('qr_token', qrToken.trim());

      await chatService.submitPickupHandover(id, payload);
      setSelectedFiles([]);
      setQrToken('');
      loadBookingHubData(); // Reload status changes live
    } catch (err) {
      setUploadError(err.response?.data?.error || "Failed uploading dispatch evidence.");
    } finally {
      setUploading(false);
    }
  };

  const handleReturnUploadSubmit = async (e) => {
    e.preventDefault();
    if (returnFiles.length === 0) {
      setUploadError("Please choose at least one return photo.");
      return;
    }

    try {
      setUploadingReturn(true);
      setUploadError('');
      setReturnSuccess('');
      
      const payload = new FormData();
      returnFiles.forEach(file => {
        payload.append('return_images', file);
      });

      await bookingService.uploadReturnEvidence(id, payload);
      setReturnFiles([]);
      setReturnSuccess('Return photos uploaded successfully!');
      loadBookingHubData();
    } catch (err) {
      setUploadError(err.response?.data?.error || "Failed uploading return evidence.");
    } finally {
      setUploadingReturn(false);
    }
  };

  const handleCompleteReturn = async () => {
    if (!window.confirm("Are you sure you want to accept this return and release the renter's deposit?")) return;
    try {
      setLoading(true);
      await bookingService.triggerBookingAction(id, 'COMPLETE');
      loadBookingHubData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed completing return.");
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeDesc.trim()) {
      setDisputeError("Please describe the damage detail.");
      return;
    }
    if (!repairCost || parseFloat(repairCost) <= 0) {
      setDisputeError("Please specify a valid repair cost.");
      return;
    }
    if (disputePhotos.length === 0) {
      setDisputeError("Please upload at least one photo of the damage.");
      return;
    }

    try {
      setRaisingDispute(true);
      setDisputeError('');
      
      const payload = new FormData();
      payload.append('booking', id);
      payload.append('description', disputeDesc.trim());
      payload.append('repair_cost', repairCost);
      disputePhotos.forEach(file => {
        payload.append('damage_photos', file);
      });

      await disputeService.raiseDamageClaim(payload);
      setDisputeDesc('');
      setRepairCost('');
      setDisputePhotos([]);
      setShowDisputeForm(false);
      loadBookingHubData();
    } catch (err) {
      setDisputeError(err.response?.data?.error || "Failed submitting dispute claim.");
    } finally {
      setRaisingDispute(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');

      await reviewService.leaveReview({
        booking: parseInt(id),
        rating: rating,
        comment: comment.trim()
      });
      
      setComment('');
      setReviewSuccess('Thank you for your feedback!');
      setTimeout(() => setShowReviewForm(false), 2000);
    } catch (err) {
      setReviewError(err.response?.data?.error || "Failed submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!booking) return <div className="text-center py-12 text-slate-500 font-bold">Lease record reference missing.</div>;

  const isOwner = booking.item_details.owner === user?.id;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      {/* Navigation Breadcrumbs Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <nav className="text-xs font-bold text-slate-400">
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link> &gt; <span>Order Coordination</span>
          </nav>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Lease Hub Reference: #B-{booking.id}</h2>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 uppercase">
          Status Matrix: {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Side: Private Interactive Messaging Thread */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[550px]">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Secure Chat Channel</h4>
              <p className="text-[10px] text-slate-400 font-medium">Coordinating with @{isOwner ? booking.renter_username : booking.item_details.owner_username}</p>
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>

          {/* Message Stream Bubble Box Layout */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-xs font-bold text-slate-400 italic">
                No communications logged yet. Say hello to arrange the asset pickup!
              </div>
            ) : (
              messages.map((msg) => {
                const isMyMessage = msg.sender === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs font-medium shadow-2xs leading-relaxed ${
                      isMyMessage ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Typing Send Input Box Component */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type your collection details message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-xs cursor-pointer select-none"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Handover Asset Status Panel Actions */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Asset Details</h4>
              <p className="text-[11px] text-blue-600 font-bold mt-0.5">{booking.item_details.title}</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-500 font-semibold">
              <div className="flex justify-between"><span>Lease Start:</span><span className="text-slate-900 font-bold">{booking.start_date}</span></div>
              <div className="flex justify-between"><span>Lease Return:</span><span className="text-slate-900 font-bold">{booking.end_date}</span></div>
              <div className="flex justify-between"><span>Rental Total:</span><span className="text-slate-900 font-bold">{formatINR(booking.rental_fee)}</span></div>
              <div className="flex justify-between"><span>Escrow Deposit:</span><span className="text-slate-900 font-bold">{formatINR(booking.deposit_amount)}</span></div>
            </div>
          </div>

          {/* Conditional Workflow Action Rendering (Module 8 Verification Steps) */}
          <div className="pt-4 border-t border-slate-100">
            {booking.status === 'APPROVED' && isOwner && !booking.is_paid && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed font-semibold text-center">
                ⏳ Waiting for the renter to complete escrow payment.
              </div>
            )}

            {booking.status === 'APPROVED' && isOwner && booking.is_paid && (
              <form onSubmit={handleHandoverSubmit} className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed font-semibold">
                  ⚡ <strong>Owner Action Required:</strong> Enter the renter's QR token and upload item condition photos to confirm pickup dispatch.
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter renter's QR token..."
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                {uploadError && <p className="text-[10px] text-red-600 font-bold">{uploadError}</p>}
                <Button type="submit" loading={uploading}>
                  Confirm Dispatch Handover
                </Button>
              </form>
            )}

            {booking.status === 'APPROVED' && !isOwner && !booking.is_paid && (
              <div className="flex justify-center">
                <PaymentCard booking={booking} onPaymentSuccess={loadBookingHubData} />
              </div>
            )}

            {booking.status === 'APPROVED' && !isOwner && booking.is_paid && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  ⏳ Payment confirmed! Escrow funds locked. Share the QR token below with the owner at physical handover.
                </p>
                {booking.qr_code && (
                  <div className="bg-white p-3 rounded-lg border border-slate-100 font-mono text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Your Handover Token</p>
                    <p className="text-xs font-bold text-slate-800 break-all select-all">{booking.qr_code.qr_token}</p>
                  </div>
                )}
              </div>
            )}

            {booking.status === 'ACTIVE' && !isOwner && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed font-semibold">
                  📦 <strong>Rental Is Active:</strong> You can optionally upload return inspection photos here when handing the item back to the owner.
                </div>
                <form onSubmit={handleReturnUploadSubmit} className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setReturnFiles([...e.target.files])}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {returnSuccess && <p className="text-[10px] text-emerald-600 font-bold">{returnSuccess}</p>}
                  {uploadError && <p className="text-[10px] text-red-600 font-bold">{uploadError}</p>}
                  <Button type="submit" loading={uploadingReturn}>
                    Upload Return Photos
                  </Button>
                </form>
              </div>
            )}

            {booking.status === 'ACTIVE' && isOwner && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed font-semibold">
                  🔄 <strong>Active Custody:</strong> Once the renter returns the item, inspect its condition. You can either accept the return or raise a damage claim.
                </div>
                
                {!showDisputeForm ? (
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleCompleteReturn}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-xs transition cursor-pointer text-center"
                    >
                      Accept Return (Release Deposit)
                    </button>
                    <button
                      onClick={() => setShowDisputeForm(true)}
                      className="w-full border border-red-200 hover:bg-red-50 text-red-600 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer text-center"
                    >
                      Raise Damage Claim (Dispute)
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDisputeSubmit} className="space-y-3 border-t border-slate-100 pt-3">
                    <h5 className="font-bold text-slate-800 text-xs">Raise Damage Claim</h5>
                    <textarea
                      required
                      placeholder="Describe the damage, component issues, etc."
                      value={disputeDesc}
                      onChange={(e) => setDisputeDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 resize-none h-20"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Estimated repair cost (₹)"
                      value={repairCost}
                      onChange={(e) => setRepairCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
                    />
                    <input
                      type="file"
                      multiple
                      required
                      accept="image/*"
                      onChange={(e) => setDisputePhotos([...e.target.files])}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {disputeError && <p className="text-[10px] text-red-600 font-bold">{disputeError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDisputeForm(false)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl py-2 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={raisingDispute}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl py-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {raisingDispute ? "Submitting..." : "Submit Claim"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {booking.status === 'DISPUTED' && (
              <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 text-xs font-semibold leading-relaxed space-y-2">
                <p>⚠️ <strong>Damage Claim Filed!</strong></p>
                <p className="text-[11px] text-red-700 font-medium">
                  A dispute is currently open. The platform admin is reviewing the evidence photos and will arbitrate the security deposit split soon.
                </p>
              </div>
            )}
            
            {booking.status === 'COMPLETED' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 text-slate-600 rounded-xl text-center text-xs font-semibold">
                  🔒 This rental lifecycle is fully completed and archived. Escrow funds have been successfully distributed.
                </div>
                
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-blue-600/10 transition cursor-pointer text-center"
                  >
                    Leave User Feedback
                  </button>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 border-t border-slate-100 pt-3">
                    <h5 className="font-bold text-slate-800 text-xs">Submit Rating & Review</h5>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-lg transition ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      required
                      placeholder="Write your review here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 resize-none h-20"
                    />
                    {reviewSuccess && <p className="text-[10px] text-emerald-600 font-bold">{reviewSuccess}</p>}
                    {reviewError && <p className="text-[10px] text-red-600 font-bold">{reviewError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl py-2 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl py-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
