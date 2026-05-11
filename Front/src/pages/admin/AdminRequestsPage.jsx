import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { requestApi } from '@/api/requestApi';
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  DollarSign,
  User,
  Calendar,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const AdminRequestsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', '0', '1', '2', '3'
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const highlightedId = searchParams.get('highlight');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        PageSize: 100
      };

      if (activeTab !== 'all') {
        params.Status = activeTab;
      }

      const res = await requestApi.getAdminRequests(params);
      const raw = res?.data?.data;
      const items = raw?.data ?? (Array.isArray(raw) ? raw : []);
      
      setAllRequests(items);
      
      // If we have a highlighted ID in the URL, open its details automatically
      if (highlightedId) {
        const highlighted = items.find(r => r.id === highlightedId);
        if (highlighted) setSelectedRequest(highlighted);
      }
    } catch (err) {
      console.error('Error fetching admin requests:', err);
      // Handle 500 or other errors
      const errorMessage = err?.response?.status === 500 
        ? "The server encountered an error (500). We're attempting to recover data." 
        : "Failed to load latest requests. Please check your connection.";
      setError(errorMessage);
      
      // Auto-retry once if it's a server error
      if (err?.response?.status === 500 && retryCount < 2) {
        setTimeout(() => setRetryCount(prev => prev + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, retryCount]);

  useEffect(() => {
    let filtered = [...allRequests];
    
    // Server-side filtering is active for status, but search is local
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.serviceTitle?.toLowerCase().includes(q) || 
        r.clientName?.toLowerCase().includes(q) ||
        r.providerName?.toLowerCase().includes(q)
      );
    }
    
    setRequests(filtered);
  }, [search, allRequests]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Local filtering is already active via search state, 
      // but we could trigger a refresh if needed
    }
  };

  const getStatusBadge = (status) => {
    const s = parseInt(status);
    switch (s) {
      case 0:
        return <div className="flex items-center text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20"><Clock size={12} className="mr-1.5" /> Pending</div>;
      case 1:
        return <div className="flex items-center text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20"><CheckCircle2 size={12} className="mr-1.5" /> Accepted</div>;
      case 2:
        return <div className="flex items-center text-error bg-error/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-error/20"><XCircle size={12} className="mr-1.5" /> Rejected</div>;
      case 3:
        return <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"><Check size={12} className="mr-1.5" /> Completed</div>;
      default:
        return <div className="text-[10px] text-primary/40 uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10">Unknown</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          
          <AdminSidebar />

          <div className="flex-grow space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">Platform Activity</h1>
                <p className="text-primary/60 dark:text-primary-light/60">Monitoring transactions and work requests.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-primary-light dark:border-dark-border shadow-sm">
                 <Button 
                   onClick={() => setActiveTab('all')}
                   variant={activeTab === 'all' ? 'default' : 'ghost'}
                   className={activeTab === 'all' ? 'bg-primary' : 'text-primary/60'}
                   size="sm"
                 >All</Button>
                 <Button 
                   onClick={() => setActiveTab('0')}
                   variant={activeTab === '0' ? 'default' : 'ghost'}
                   className={activeTab === '0' ? 'bg-amber-500 hover:bg-amber-600' : 'text-primary/60'}
                   size="sm"
                 >Pending</Button>
                 <Button 
                   onClick={() => setActiveTab('1')}
                   variant={activeTab === '1' ? 'default' : 'ghost'}
                   className={activeTab === '1' ? 'bg-blue-500 hover:bg-blue-600' : 'text-primary/60'}
                   size="sm"
                 >Accepted</Button>
                 <Button 
                   onClick={() => setActiveTab('3')}
                   variant={activeTab === '3' ? 'default' : 'ghost'}
                   className={activeTab === '3' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-primary/60'}
                   size="sm"
                 >Completed</Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by client, provider, or service title..." 
                className="h-14 pl-12 rounded-2xl border-primary-light dark:border-dark-border bg-white dark:bg-dark-card focus:ring-primary shadow-sm"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-primary/60">Scanning requests...</p>
              </div>
            ) : error ? (
              <div className="bento-card p-12 text-center border-error/20 bg-error/5">
                <AlertCircle size={48} className="text-error mx-auto mb-4" />
                <h3 className="text-xl font-bold text-error mb-2">Sync Error</h3>
                <p className="text-primary/60 mb-6">{error}</p>
                <Button onClick={() => setRetryCount(prev => prev + 1)} variant="outline" className="border-error text-error hover:bg-error/10">
                  Force Refresh
                </Button>
              </div>
            ) : requests.length === 0 ? (
              <div className="bento-card p-20 text-center">
                <MessageSquare size={48} className="text-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold dark:text-white mb-2">No requests found</h3>
                <p className="text-primary/40">Activity filter returned zero results.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mobile/Small Screen Card View */}
                <div className="grid grid-cols-1 gap-4 lg:hidden">
                   {requests.map((r) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={r.id} 
                        onClick={() => setSelectedRequest(r)}
                        className={`bento-card p-5 bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border cursor-pointer relative overflow-hidden transition-all ${highlightedId === r.id ? 'ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10' : ''}`}
                      >
                         {highlightedId === r.id && (
                            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                               New
                            </div>
                         )}
                         <div className="flex items-center justify-between mb-3 border-b border-primary-light dark:border-dark-border pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">ID: {r.id?.slice(0, 8)}</span>
                            {getStatusBadge(r.status)}
                         </div>
                         <h3 className="text-lg font-black text-primary dark:text-white mb-2 leading-tight">{r.serviceTitle || "Untitled Service"}</h3>
                         <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">Client</p>
                               <p className="text-xs font-bold truncate">{r.clientName}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-primary/30 uppercase tracking-[0.2em]">Provider</p>
                               <p className="text-xs font-bold truncate">{r.providerName}</p>
                            </div>
                         </div>
                         <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl">
                               <DollarSign size={14} className="opacity-40" />
                               <span>{r.agreedPrice}</span>
                            </div>
                            <div className="text-[10px] font-bold text-primary/40 flex items-center">
                               <Calendar size={12} className="mr-1.5 opacity-50" />
                               {new Date(r.createdAt).toLocaleDateString()}
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white dark:bg-dark-card rounded-3xl border border-primary-light dark:border-dark-border overflow-hidden shadow-sm shadow-primary/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8F7FF] dark:bg-dark-bg border-b border-primary-light dark:border-dark-border">
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Service Item</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Parties</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Agreed Value</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Created</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-light dark:divide-dark-border">
                      {requests.map((r) => (
                        <tr 
                          key={r.id} 
                          className={`hover:bg-primary/5 transition-all group cursor-pointer ${highlightedId === r.id ? 'bg-primary/10 ring-1 ring-primary/20' : ''}`}
                          onClick={() => setSelectedRequest(r)}
                        >
                          <td className="px-6 py-5">
                             <p className="font-black dark:text-white truncate max-w-xs">{r.serviceTitle || "Unnamed Service"}</p>
                             <div className="flex items-center text-[10px] text-primary/20 font-black tracking-tighter mt-1 uppercase">
                                ID: {r.id?.slice(0, 8) || "N/A"}
                                {highlightedId === r.id && (
                                  <span className="ml-2 px-1.5 bg-primary text-white rounded animate-pulse capitalize text-[8px]">New Activity</span>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className="space-y-1">
                                <div className="flex items-center text-xs font-bold text-primary/60 dark:text-primary-light/60">
                                   <div className="w-4 h-4 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 mr-2 shrink-0">C</div>
                                   <span className="truncate">{r.clientName}</span>
                                </div>
                                <div className="flex items-center text-xs font-bold text-primary/60 dark:text-primary-light/60">
                                   <div className="w-4 h-4 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 mr-2 shrink-0">P</div>
                                   <span className="truncate">{r.providerName}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center text-primary font-black">
                                <DollarSign size={14} className="opacity-40" />
                                <span>{r.agreedPrice}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             {getStatusBadge(r.status)}
                          </td>
                          <td className="px-6 py-5 font-bold text-primary/40 text-xs">
                             <div className="flex items-center">
                                <Calendar size={12} className="mr-2 opacity-50" />
                                {new Date(r.createdAt).toLocaleDateString()}
                             </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <Button 
                               onClick={() => setSelectedRequest(r)}
                               variant="ghost" 
                               size="sm"
                               className="text-primary hover:bg-primary/10 rounded-lg font-bold text-xs"
                             >
                               Details
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Request Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-primary-light dark:border-dark-border"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">Request Audit</h2>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedRequest.status)}
                  <span className="text-xs font-bold text-primary/20 uppercase tracking-widest">#{selectedRequest.id.slice(0, 8)}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl text-primary/40 hover:bg-primary-light"
              >
                <XCircle size={24} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="bg-primary-light/10 dark:bg-dark-bg p-4 rounded-2xl border border-primary-light dark:border-dark-border">
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-3">Client Profile</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                      {selectedRequest.clientName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold dark:text-white">{selectedRequest.clientName}</p>
                      <p className="text-[10px] text-primary/40">Buyer</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-light/10 dark:bg-dark-bg p-4 rounded-2xl border border-primary-light dark:border-dark-border">
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-3">Provider Profile</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                      {selectedRequest.providerName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold dark:text-white">{selectedRequest.providerName}</p>
                      <p className="text-[10px] text-primary/40">Seller</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-primary-light/10 dark:bg-dark-bg p-4 rounded-2xl border border-primary-light dark:border-dark-border">
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Financial Analysis</p>
                  <p className="text-2xl font-black text-primary dark:text-white">${selectedRequest.agreedPrice}</p>
                  <p className="text-[10px] text-primary/40 font-bold uppercase tracking-tighter">Settlement Value</p>
                </div>
                
                <div className="bg-primary-light/10 dark:bg-dark-bg p-4 rounded-2xl border border-primary-light dark:border-dark-border">
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Timeline</p>
                  <p className="font-bold dark:text-white">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  <p className="text-[10px] text-primary/40 font-bold uppercase tracking-tighter">Creation Timestamp</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F7FF] dark:bg-dark-bg p-6 rounded-2xl border-2 border-dashed border-primary/10">
              <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-4 flex items-center">
                <MessageSquare size={12} className="mr-2" />
                Initial Discussion / Message
              </p>
              <p className="text-sm font-medium text-primary/70 dark:text-primary-light/70 italic leading-relaxed">
                {selectedRequest.message || "No initial message provided."}
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={() => setSelectedRequest(null)} className="bg-primary hover:bg-primary-dark rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs">
                Close Audit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AdminRequestsPage;
