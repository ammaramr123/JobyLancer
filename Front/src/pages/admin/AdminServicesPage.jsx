import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { servicesApi } from '@/api/servicesApi';
import { requestApi } from '@/api/requestApi';
import useNotifications from '@/hooks/useNotifications';
import { 
  Briefcase, 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildImageUrl } from '@/lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const AdminServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStatus = searchParams.get('status') || 'all';
  
  const [allServices, setAllServices] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialStatus); // 'all', '0', '1', '2'
  const [expandedRequests, setExpandedRequests] = useState({}); // track which service has expanded requests

  useEffect(() => {
    const status = searchParams.get('status') || 'all';
    setActiveTab(status);
  }, [searchParams]);

  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Real-time notifications hook
  const { isConnected } = useNotifications();
  
  // Rejection Modal State
  const [rejectingService, setRejectingService] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchServicesAndRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesRes, requestsRes] = await Promise.allSettled([
        servicesApi.getServices({ PageSize: 100, Status: activeTab !== 'all' ? activeTab : undefined }),
        requestApi.getAdminRequests({ PageSize: 500 })
      ]);

      let sData = [];
      let rData = [];

      if (servicesRes.status === 'fulfilled') {
        const raw = servicesRes.value?.data?.data;
        sData = raw?.data ?? (Array.isArray(raw) ? raw : []);
      } else {
        console.error('Error fetching services:', servicesRes.reason);
        toast.error('Failed to load services list');
      }

      if (requestsRes.status === 'fulfilled') {
        const rawReq = requestsRes.value?.data?.data;
        rData = rawReq?.data ?? (Array.isArray(rawReq) ? rawReq : []);
      } else {
        console.error('Error fetching requests for services:', requestsRes.reason);
        // If it's a 500 on requests, we don't necessarily want to block the whole page
        if (requestsRes.reason?.response?.status === 500 && retryCount < 1) {
           setTimeout(() => setRetryCount(prev => prev + 1), 1500);
        }
      }
      
      setAllServices(Array.isArray(sData) ? sData : []);
      setAllRequests(Array.isArray(rData) ? rData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError("Unable to sync with marketplace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndRequests();
  }, [activeTab, retryCount]);

  // Listen for real-time update events
  useEffect(() => {
    const handleRefresh = (event) => {
      console.log('Real-time notification received, refreshing services...', event.detail);
      fetchServicesAndRequests();
    };

    window.addEventListener('new-notification', handleRefresh);
    return () => window.removeEventListener('new-notification', handleRefresh);
  }, []);

  useEffect(() => {
    let filtered = [...allServices];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title?.toLowerCase().includes(q) || 
        s.providerName?.toLowerCase().includes(q)
      );
    }
    
    setServices(filtered);
  }, [search, allServices]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Local filtering is already active via search state
      console.log('Search submitted:', search);
    }
  };

  const handleTabChange = (status) => {
    setActiveTab(status);
    setSearchParams({ status });
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await servicesApi.updateServiceStatus(id, { status: 1 });
      toast.success('Service approved - now visible to all users');
      setAllServices(prev => prev.map(s => s.id === id ? { ...s, status: 1 } : s));
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error('Failed to approve service');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingService || !rejectionReason.trim()) return;
    
    const id = rejectingService.id;
    try {
      setProcessingId(id);
      await servicesApi.updateServiceStatus(id, { status: 2, rejectionReason });
      toast.success(`Service rejected: ${rejectionReason}`);
      setAllServices(prev => prev.map(s => s.id === id ? { ...s, status: 2, rejectionReason } : s));
      setRejectingService(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error('Failed to reject service');
    } finally {
      setProcessingId(null);
    }
  };

  const getRequestsForService = (serviceId) => {
    return allRequests.filter(r => 
      r.serviceId === serviceId || 
      r.service?.id === serviceId ||
      r.serviceTitle === allServices.find(s => s.id === serviceId)?.title
    );
  };

  const toggleRequests = (serviceId) => {
    setExpandedRequests(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const getStatusBadge = (status) => {
    const s = parseInt(status);
    switch (s) {
      case 0:
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Pending Review</span>;
      case 1:
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active</span>;
      case 2:
        return <span className="px-3 py-1 bg-error/10 text-error rounded-lg text-[10px] font-black uppercase tracking-widest border border-error/20">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-primary/10 text-primary/40 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">Unknown</span>;
    }
  };

  const getRequestStatusIcon = (status) => {
    const s = parseInt(status);
    switch (s) {
      case 0: return <Clock size={12} className="text-amber-500" />;
      case 1: return <CheckCircle size={12} className="text-blue-500" />;
      case 2: return <XCircle size={12} className="text-error" />;
      case 3: return <CheckCircle size={12} className="text-emerald-500" />;
      default: return null;
    }
  };

  const getRequestStatusText = (status) => {
    const s = parseInt(status);
    switch (s) {
      case 0: return "Pending";
      case 1: return "Accepted";
      case 2: return "Rejected";
      case 3: return "Completed";
      default: return "Unknown";
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
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">Service Quality</h1>
                  <p className="text-primary/60 dark:text-primary-light/60 font-medium">Review and moderate service listings.</p>
                </div>
                {isConnected && (
                  <div className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                    <Bell size={10} className="mr-1" />
                    Live
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-primary-light dark:border-dark-border shadow-sm">
                 <Button 
                   onClick={() => handleTabChange('all')}
                   variant={activeTab === 'all' ? 'default' : 'ghost'}
                   className={activeTab === 'all' ? 'bg-primary' : 'text-primary/60'}
                   size="sm"
                 >All</Button>
                 <Button 
                   onClick={() => handleTabChange('0')}
                   variant={activeTab === '0' ? 'default' : 'ghost'}
                   className={activeTab === '0' ? 'bg-amber-500 hover:bg-amber-600' : 'text-primary/60'}
                   size="sm"
                 >Pending</Button>
                 <Button 
                   onClick={() => handleTabChange('1')}
                   variant={activeTab === '1' ? 'default' : 'ghost'}
                   className={activeTab === '1' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-primary/60'}
                   size="sm"
                 >Active</Button>
                 <Button 
                   onClick={() => handleTabChange('2')}
                   variant={activeTab === '2' ? 'default' : 'ghost'}
                   className={activeTab === '2' ? 'bg-red-500 hover:bg-red-600' : 'text-primary/60'}
                   size="sm"
                 >Rejected</Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by service title or provider..." 
                className="h-14 pl-12 rounded-2xl border-primary-light dark:border-dark-border bg-white dark:bg-dark-card focus:ring-primary shadow-sm"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-primary/60">Auditing services...</p>
              </div>
            ) : error ? (
              <div className="bento-card p-12 text-center border-error/20 bg-error/5">
                <AlertCircle size={48} className="text-error mx-auto mb-4" />
                <h3 className="text-xl font-bold text-error mb-2">Service Audit Failed</h3>
                <p className="text-primary/60 mb-6">{error}</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setRetryCount(prev => prev + 1)} variant="outline" className="border-error text-error hover:bg-error/10">
                    Retry Synchronization
                  </Button>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="bento-card p-20 text-center">
                <Briefcase size={48} className="text-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold dark:text-white mb-2">No services found</h3>
                <p className="text-primary/40">The marketplace is currently quiet or filter is too restrictive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {services.map((s) => (
                  <motion.div 
                    layout
                    key={s.id} 
                    className="bento-card bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border overflow-hidden"
                  >
                       {/* Card Body: Image (Left) | Details (Center) | Actions (Right) */}
                       <div className="flex flex-col lg:flex-row gap-6">
                          {/* 1. Thumbnail (Left) */}
                          <div className="w-full lg:w-56 h-40 lg:h-auto rounded-2xl bg-primary/10 shrink-0 overflow-hidden relative group">
                             {s.thumbnailImageUrl || s.imageUrl ? (
                               <img src={buildImageUrl(s.thumbnailImageUrl || s.imageUrl)} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-primary/30">
                                  <Briefcase size={32} />
                               </div>
                             )}
                             <div className="absolute top-2 right-2">
                                {getStatusBadge(s.status)}
                             </div>
                          </div>

                          {/* 2. Content (Center) */}
                          <div className="flex-grow space-y-4">
                             <div>
                                <div className="flex items-center justify-between mb-1">
                                   <Link to={`/service/${s.id}`} className="hover:text-primary transition-colors">
                                      <h3 className="text-xl font-black text-[#1F1035] dark:text-white tracking-tight">{s.title}</h3>
                                   </Link>
                                   <div className="flex items-center text-emerald-600 font-black lg:hidden">
                                      <DollarSign size={16} />
                                      <span>{s.price}</span>
                                   </div>
                                </div>
                                <p className="text-sm text-primary/60 dark:text-primary-light/60 line-clamp-3 mb-3 leading-relaxed">{s.description}</p>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                   <span className="bg-primary/5 px-2 py-1 rounded dark:text-white/60">Created: {new Date(s.createdAt).toLocaleDateString()}</span>
                                   <span className="bg-primary/5 px-2 py-1 rounded dark:text-white/60">Delivery: {s.deliveryDays || 'N/A'} Days</span>
                                </div>
                             </div>

                             <div className="flex flex-wrap items-center gap-6 text-xs font-bold">
                                <div className="flex items-center space-x-2 group/provider cursor-pointer" title="View Provider Profile">
                                   <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10 border border-primary/5">
                                      {s.providerImageUrl ? (
                                         <img src={buildImageUrl(s.providerImageUrl)} alt={s.providerName} className="w-full h-full object-cover" />
                                      ) : (
                                         <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10 text-[10px]">
                                            {(s.providerName || s.provider?.fullName)?.charAt(0) || <User size={10} />}
                                         </div>
                                      )}
                                   </div>
                                   <span className="text-primary/60 dark:text-primary-light/60 group-hover/provider:text-primary transition-colors">
                                      {s.providerName || s.provider?.fullName || "—"}
                                   </span>
                                </div>
                                
                                <div className="flex items-center space-x-1.5 text-primary/40">
                                   <AlertCircle size={14} className="text-primary/20" />
                                   <span>{s.categoryName || "Uncategorized"}</span>
                                </div>

                                {getRequestsForService(s.id).length > 0 && (
                                  <button 
                                    onClick={() => toggleRequests(s.id)}
                                    className="flex items-center space-x-1 px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                                  >
                                    <MessageSquare size={12} className="opacity-50" />
                                    <span>{getRequestsForService(s.id).length} Orders</span>
                                    {expandedRequests[s.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </button>
                                )}
                             </div>

                             {s.rejectionReason && (
                                <div className="flex items-center space-x-1.5 text-error w-full p-3 bg-error/5 rounded-xl border border-error/10">
                                   <XCircle size={14} />
                                   <span className="font-bold">Rejected: {s.rejectionReason}</span>
                                </div>
                             )}
                          </div>

                          {/* 3. Actions (Right) */}
                          <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-primary-light dark:border-dark-border pt-6 lg:pt-0 lg:pl-6 space-y-4">
                             <div className="hidden lg:flex flex-col items-end">
                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1">Service Value</p>
                                <div className="flex items-center text-3xl font-black text-primary dark:text-white">
                                   <DollarSign size={24} className="text-emerald-500 mr-1" />
                                   <span>{s.price}</span>
                                </div>
                             </div>

                             <div className="space-y-3">
                                {parseInt(s.status) === 0 ? (
                                   <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                      <Button 
                                        onClick={() => handleApprove(s.id)}
                                        disabled={processingId === s.id}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 font-black uppercase tracking-widest text-[10px]"
                                      >
                                        {processingId === s.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="mr-2" />}
                                        Approve
                                      </Button>
                                      <Button 
                                        onClick={() => setRejectingService(s)}
                                        disabled={processingId === s.id}
                                        variant="outline"
                                        className="border-error text-error hover:bg-error/10 rounded-xl h-11 font-black uppercase tracking-widest text-[10px]"
                                      >
                                        <XCircle size={16} className="mr-2" />
                                        Reject
                                      </Button>
                                   </div>
                                ) : (
                                   <Link to={`/service/${s.id}`} className="block">
                                      <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 rounded-xl h-11 font-black uppercase tracking-widest text-[10px]">
                                         View Public Page
                                      </Button>
                                   </Link>
                                )}
                                
                                <Button 
                                   variant="ghost" 
                                   onClick={() => navigate('/admin/requests')}
                                   className="w-full text-primary/40 hover:text-primary rounded-xl font-bold text-xs"
                                >
                                   Financial History
                                </Button>
                             </div>
                          </div>
                       </div>

                       {/* Related Requests List */}
                       <AnimatePresence>
                         {expandedRequests[s.id] && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden bg-[#F8F7FF] dark:bg-dark-bg/50 rounded-2xl border border-primary-light dark:border-dark-border mt-2 mb-4 mx-6"
                           >
                             <div className="p-4 space-y-3">
                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest pl-2">Associated Work Requests</p>
                                {getRequestsForService(s.id).map(r => (
                                  <div key={r.id} className="bg-white dark:bg-dark-card p-3 rounded-xl flex items-center justify-between border border-primary/5 hover:border-primary/20 transition-all group">
                                     <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                           {r.clientName?.charAt(0)}
                                        </div>
                                        <div>
                                           <p className="text-xs font-bold dark:text-white">{r.clientName}</p>
                                           <div className="flex items-center text-[10px] text-primary/40 font-black tracking-widest">
                                              {getRequestStatusIcon(r.status)}
                                              <span className="ml-1 uppercase">{getRequestStatusText(r.status)}</span>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-xs font-black text-primary dark:text-white">${r.agreedPrice}</p>
                                        <button 
                                           onClick={() => navigate('/admin/requests')}
                                           className="text-[9px] font-black text-primary/20 group-hover:text-primary uppercase tracking-tighter flex items-center justify-end"
                                        >
                                           Audit <ArrowRight size={10} className="ml-1" />
                                        </button>
                                     </div>
                                  </div>
                                ))}
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>

                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-error"></div>
              
              <h2 className="text-2xl font-black text-[#1F1035] dark:text-white mb-2">Reject Service</h2>
              <p className="text-primary/60 dark:text-primary-light/60 mb-6 font-medium">Please provide a reason why "{rejectingService.title}" is being rejected.</p>
              
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Technical description insufficient, images low quality, or violates platform policies..."
                className="w-full h-40 p-4 rounded-2xl border-2 border-primary/10 bg-[#F8F7FF] dark:bg-dark-bg dark:text-white focus:border-primary outline-none resize-none font-medium mb-8"
              />

              <div className="flex gap-4">
                <Button 
                  onClick={() => { setRejectingService(null); setRejectionReason(''); }}
                  variant="ghost" 
                  className="flex-1 rounded-xl h-12 font-bold"
                >Cancel</Button>
                <Button 
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processingId === rejectingService.id}
                  className="flex-1 bg-error hover:bg-error/80 text-white rounded-xl h-12 font-bold shadow-lg shadow-error/20"
                >
                  {processingId === rejectingService.id ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Rejection'}
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

export default AdminServicesPage;
