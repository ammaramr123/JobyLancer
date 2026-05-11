import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { requestApi } from '@/api/requestApi';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Package, CheckCircle2, Clock, AlertCircle, ChevronRight, MessageSquare, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const STATUS_MAP = {
  'Pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  'Accepted': { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'Rejected': { label: 'Rejected', color: 'bg-error/10 text-error border-error/20' },
  'Completed': { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' }
};

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
  try {
    setLoading(true);
    setError(null);
    const res = await requestApi.getClientRequests(); // ← السطر ده ناقص
    const apiData = res?.data?.data?.data;
    setRequests(Array.isArray(apiData) ? apiData : []);
  } catch (err) {
    console.error('API error fetching requests:', err);
    setError('Failed to load requests. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'All') return true;
    return req.status === activeTab;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-4">My Requests</h1>
          <p className="text-[#6B7280] dark:text-primary-light/60">Track your order progress and communicate with providers.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/50 dark:bg-dark-card/50 p-1.5 rounded-2xl border border-primary-light dark:border-dark-border inline-flex">
          {['All', 'Pending', 'Accepted', 'Rejected', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 text-sm ${activeTab === tab
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'text-primary/40 hover:text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-primary/60 dark:text-primary-light/60">Loading your timeline...</p>
          </div>
        ) : error ? (
          <div className="bento-card p-12 text-center flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-error mb-6" />
            <h3 className="text-xl font-bold dark:text-white mb-2">{error}</h3>
            <Button onClick={fetchRequests} className="mt-4 bg-primary text-white">Retry</Button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bento-card p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-primary-light/20 rounded-3xl flex items-center justify-center text-primary mb-8">
              <Package size={40} />
            </div>
            <h3 className="text-2xl font-bold dark:text-white mb-2">No {activeTab.toLowerCase()} requests</h3>
            <p className="text-[#6B7280] dark:text-primary-light/60 mb-8 max-w-sm">
              {activeTab === 'All'
                ? "You haven't placed any service requests yet."
                : `You don't have any requests in ${activeTab.toLowerCase()} status.`
              }
            </p>
            <Link to="/services">
              <Button className="bg-primary hover:bg-primary-dark">Browse Services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRequests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary/50"
                >
                  <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Package size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold dark:text-white group-hover:text-primary transition-colors">{req.serviceTitle}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <p className="text-sm font-medium text-[#6B7280] dark:text-primary-light/60">Provider: <span className="font-bold text-primary">{req.providerName}</span></p>
                        <div className="w-1 h-1 bg-primary/20 rounded-full hidden sm:block"></div>
                        <p className="text-sm font-medium dark:text-white italic">${req.agreedPrice || req.price}</p>
                        <div className="w-1 h-1 bg-primary/20 rounded-full hidden sm:block"></div>
                        <p className="text-xs text-primary/40">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_MAP[req.status]?.color}`}>
                      {STATUS_MAP[req.status]?.label || req.status}
                    </div>
                    <div className="flex items-center space-x-2">
                      {req.status === 'Accepted' && (
                        <Link to={`/chat/${req.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl border-primary-light dark:border-dark-border h-10 px-4">
                            <MessageSquare size={16} className="mr-2" />
                            Chat
                          </Button>
                        </Link>
                      )}
                      {req.status === 'Completed' && (
                        <Link to="/client/review" state={{ requestId: req.id }}>
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-xl h-10 px-4">
                            Review
                          </Button>
                        </Link>
                      )}
                      <Link to={`/client/requests/${req.id}`}>
                        <Button variant="ghost" className="rounded-xl h-10 w-10 p-0 text-primary/40 hover:text-primary bg-primary/5">
                          <ChevronRight size={20} />
                        </Button>
                      </Link>
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

export default MyRequestsPage;