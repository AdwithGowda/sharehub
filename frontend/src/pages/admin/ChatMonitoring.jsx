import React, { useState, useEffect, useRef, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';

export default function ChatMonitoring() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [disputeOnly, setDisputeOnly] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Load conversation threads
  useEffect(() => {
    loadThreads(true);
  }, []);

  const loadThreads = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const data = await adminService.getChatThreads();
      setThreads(data);
    } catch (err) {
      console.error("Failed loading chat threads:", err);
      setError("Failed to load active conversation threads.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Load message logs for the active thread
  useEffect(() => {
    if (!activeBookingId) {
      setMessages([]);
      return;
    }

    loadMessages(true);

    // Setup polling for live chat monitoring (every 5 seconds)
    const interval = setInterval(() => {
      loadMessages(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBookingId]);

  const loadMessages = async (showLoader = false) => {
    try {
      if (showLoader) setMessagesLoading(true);
      const data = await adminService.getChatMessages(activeBookingId);
      setMessages(data);
    } catch (err) {
      console.error("Failed loading messages:", err);
    } finally {
      if (showLoader) setMessagesLoading(false);
    }
  };

  // Scroll to bottom of message thread
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Client-side filtering of conversation threads
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchSearch =
        (t.item_title || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.renter_username || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.owner_username || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.last_message || '').toLowerCase().includes(search.toLowerCase());

      const matchDispute = !disputeOnly || t.status === 'DISPUTED';

      return matchSearch && matchDispute;
    });
  }, [threads, search, disputeOnly]);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.booking_id === activeBookingId);
  }, [threads, activeBookingId]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chat Monitor & Dispute Compliance</h2>
          <p className="text-sm text-slate-500 mt-1">Audit platform communication logs, resolve misunderstandings, and review dispute negotiation context.</p>
        </div>
        <button
          onClick={() => loadThreads(false)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-center font-semibold"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
          </svg>
          Refresh Directory
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Main Dual-Pane Dashboard Container */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr] min-h-[600px] max-h-[750px] items-stretch">
        
        {/* Left Pane: Thread Explorer */}
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xs flex flex-col overflow-hidden h-[600px] lg:h-auto">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search usernames, gear, messages..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={disputeOnly}
                onChange={(e) => setDisputeOnly(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-red-600 focus:ring-red-500/10 cursor-pointer"
              />
              <span className={disputeOnly ? "text-red-600 font-extrabold" : ""}>Show Disputes Only</span>
              {disputeOnly && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block"></span>
              )}
            </label>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No active conversations found.
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isActive = t.booking_id === activeBookingId;
                const isDisputed = t.status === 'DISPUTED';

                return (
                  <button
                    key={t.booking_id}
                    onClick={() => setActiveBookingId(t.booking_id)}
                    className={`w-full text-left p-4 transition duration-150 flex flex-col gap-1.5 border-l-4 ${
                      isActive
                        ? 'bg-blue-50/50 border-blue-600'
                        : isDisputed
                        ? 'hover:bg-red-50/30 border-red-500 bg-red-50/10'
                        : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Booking #{t.booking_id}
                      </span>
                      {isDisputed && (
                        <span className="rounded-full bg-red-100 border border-red-200 text-red-700 text-[8px] font-black uppercase px-2 py-0.5 animate-pulse">
                          DISPUTE ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{t.item_title}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">@{t.renter_username}</span>
                      <span>&rarr;</span>
                      <span className="font-semibold text-slate-700">@{t.owner_username}</span>
                    </div>

                    {t.last_message && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                          "{t.last_message}"
                        </p>
                        <p className="text-[9px] text-slate-400 text-right">
                          {t.last_message_sender ? `@${t.last_message_sender} • ` : ''}
                          {t.last_message_time ? new Date(t.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Viewer */}
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xs flex flex-col overflow-hidden h-[600px] lg:h-auto">
          {!activeBookingId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-700 text-sm">Select a Conversation Thread</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Click on any conversation in the list on the left to audit messages and monitor dispute discussions.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header Info Banner */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">{activeThread?.item_title}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase ${
                      activeThread?.status === 'DISPUTED'
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {activeThread?.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Booking ID: #{activeBookingId} • Renter: <span className="font-bold text-slate-700">@{activeThread?.renter_username}</span> • Owner: <span className="font-bold text-slate-700">@{activeThread?.owner_username}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {messagesLoading && (
                    <span className="text-[10px] text-slate-400 font-bold animate-pulse">Syncing logs...</span>
                  )}
                  <button
                    onClick={() => loadMessages(true)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 cursor-pointer shadow-xs"
                    title="Force refresh chat"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Message History Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs py-10">
                    No messages recorded in this booking thread yet.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isRenter = msg.sender_username === activeThread?.renter_username;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[75%] ${
                          isRenter ? 'mr-auto items-start' : 'ml-auto items-end'
                        }`}
                      >
                        {/* Sender Label */}
                        <span className="text-[9px] text-slate-400 font-bold mb-1 px-1">
                          @{msg.sender_username} ({isRenter ? 'Renter' : 'Owner'})
                        </span>
                        
                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-xs ${
                            isRenter
                              ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>

                        {/* Timestamp */}
                        <span className="text-[8px] text-slate-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Administrative Information Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>This session is a read-only compliance monitor. All logs are securely archived.</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live auditing
                </span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
