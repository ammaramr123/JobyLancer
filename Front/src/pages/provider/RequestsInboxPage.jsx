import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { requestApi } from '@/api/requestApi';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2, Mail, CheckCircle2, XCircle, Clock,
  AlertCircle, ChevronRight, MessageSquare, DollarSign,
  User, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const RequestsInboxPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestApi.getProviderRequests();
      const apiData = res?.data?.data?.data;
      setRequests(Array.isArray(apiData) ? apiData : []);
      console.log('provider requests:', JSON.stringify(res?.data, null, 2));
    } catch (err) {
      console.error('Error fetching provider requests:', err);
      setError('Failed to load your inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);
      if (action === 'accept') {
        await requestApi.acceptRequest(id);
        toast.success('Request accepted successfully!');
      } else if (action === 'reject') {
        const reason = window.prompt('Reason for rejection:', 'Not available at this time');
        if (reason === null) return; // Cancelled prompt
        await requestApi.rejectRequest(id, reason);
        toast.success('Request declined.');
      } else if (action === 'complete') {
        await requestApi.completeRequest(id);
        toast.success('Project marked as complete!');
      }
      fetchRequests();
    } catch (err) {
      console.error('Request action error:', err);
      toast.error(err.response?.data?.message || 'Failed to perform action.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-primary-light text-primary border-primary-light';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-4">Requests Inbox</h1>
            <p className="text-[#6B7280] dark:text-primary-light/60">Respond to clients and manage your active project pipeline.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border rounded-2xl px-6 py-3 flex items-center space-x-3 shadow-sm">
              <Mail className="text-primary" size={20} />
              <span className="font-bold text-[#1F1035] dark:text-white">{requests.filter(r => r.status === 'Pending').length} New</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-primary/60 dark:text-primary-light/60">Fetching your incoming opportunities...</p>
          </div>
        ) : error ? (
          <div className="bento-card p-12 text-center flex flex-col items-center justify-center bg-error/5 border-error/20">
            <AlertCircle size={48} className="text-error mb-6" />
            <h3 className="text-xl font-bold dark:text-white mb-2">{error}</h3>
            <Button onClick={fetchRequests} className="mt-4 bg-primary text-white">Retry Inbox</Button>
          </div>
        ) : requests.length === 0 ? (
          <div className="bento-card p-24 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center text-primary mb-8 animate-pulse">
              <Mail size={48} />
            </div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">Inbox Empty</h3>
            <p className="text-[#6B7280] dark:text-primary-light/60 mb-8 max-w-sm">You don't have any incoming requests yet. Make sure your services are active and optimized for search!</p>
            <Button className="bg-primary hover:bg-primary-dark">Optimize Services</Button>
          </div>
        ) : (
          <div className="grid gap-8">
            <AnimatePresence mode="popLayout">
              {requests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bento-card group hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-visible"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Left Info Panel */}
                    <div className="p-8 flex-grow">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </div>
                        <div className="flex items-center text-primary/40 dark:text-primary-light/40 text-xs font-bold uppercase tracking-widest">
                          <Calendar size={14} className="mr-2" />
                          Placed {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-[#1F1035] dark:text-white mb-4 group-hover:text-primary transition-colors">
                        {req.serviceTitle}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-primary-light/10 dark:bg-dark-bg/50 border border-primary-light dark:border-dark-border/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center text-primary shadow-sm">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Client</p>
                            <p className="font-bold dark:text-white">{req.clientName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center text-accent shadow-sm">
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-accent/60 uppercase tracking-widest leading-none mb-1">Budget</p>
                            <p className="font-bold dark:text-white font-mono">${req.agreedPrice}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions Panel */}
                    <div className="p-8 lg:w-80 bg-primary-light/5 dark:bg-dark-bg/20 border-t lg:border-t-0 lg:border-l border-primary-light dark:border-dark-border flex flex-col justify-center space-y-4">
                      {req.status === 'Pending' ? (
                        <>
                          <Button
                            onClick={() => handleAction(req.id, 'accept')}
                            disabled={actionLoading === req.id}
                            className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            {actionLoading === req.id ? <Loader2 className="animate-spin" /> : (
                              <div className="flex items-center">
                                <CheckCircle2 size={18} className="mr-2" />
                                Accept Request
                              </div>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={actionLoading === req.id}
                            variant="outline"
                            className="w-full h-14 border-primary-light dark:border-dark-border hover:bg-error/10 hover:text-error hover:border-error/20 rounded-xl font-bold transition-all"
                          >
                            <XCircle size={18} className="mr-2" />
                            Decline
                          </Button>
                        </>
                      ) : req.status === 'Accepted' ? (
                        <>
                          <Button
                            onClick={() => handleAction(req.id, 'complete')}
                            disabled={actionLoading === req.id}
                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                          >
                            {actionLoading === req.id ? <Loader2 className="animate-spin" /> : (
                              <div className="flex items-center">
                                <CheckCircle2 size={18} className="mr-2" />
                                Mark as Complete
                              </div>
                            )}
                          </Button>
                          <Button
                            onClick={() => navigate(`/chat/${req.id}`)}
                            className="w-full h-14 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10 rounded-xl font-bold transition-all">
                            <MessageSquare size={18} className="mr-2" />
                            Message Client
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button className="w-full h-14 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10 rounded-xl font-bold transition-all">
                            <MessageSquare size={18} className="mr-2" />
                            Message Client
                          </Button>
                          <Button variant="ghost" className="w-full h-12 text-primary/40 font-bold hover:text-primary transition-colors">
                            View Details
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RequestsInboxPage;
