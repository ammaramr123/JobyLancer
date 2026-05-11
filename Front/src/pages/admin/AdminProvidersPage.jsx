import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi } from '@/api/adminApi';
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Filter,
  Star,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildImageUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';



const AdminProvidersPage = () => {
  const [allProviders, setAllProviders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'Pending', 'Approved', 'Rejected'
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = {
        PageSize: 1000
      };

      const res = await adminApi.getProviders(params);
      const responseData = res?.data?.data;
      const items = responseData?.data || responseData;
      
      if (Array.isArray(items)) {
        setAllProviders(items);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      toast.error('Failed to load providers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    let filtered = [...allProviders];
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.accountStatus === activeTab);
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.fullName || p.name || '').toLowerCase().includes(q) || 
        (p.email || '').toLowerCase().includes(q)
      );
    }
    
    setProviders(filtered);
  }, [activeTab, search, allProviders]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Local filtering active
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await adminApi.approveProvider(id);
      toast.success('Provider approved');
      // Optimistic update
      setAllProviders(prev => prev.map(p => p.id === id ? { ...p, accountStatus: 'Approved' } : p));
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error('Failed to approve provider');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this provider?")) return;
    try {
      setProcessingId(id);
      await adminApi.rejectProvider(id);
      toast.success('Provider rejected');
      // Optimistic update
      setAllProviders(prev => prev.map(p => p.id === id ? { ...p, accountStatus: 'Rejected' } : p));
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error('Failed to reject provider');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Pending</span>;
      case 'Approved':
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 bg-error/10 text-error rounded-lg text-[10px] font-black uppercase tracking-widest border border-error/20">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-primary/10 text-primary/40 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">{status || 'Unknown'}</span>;
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
                <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">Providers</h1>
                <p className="text-primary/60 dark:text-primary-light/60">Manage freelancer accounts and verifications.</p>
              </div>
              
              <div className="flex items-center space-x-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-primary-light dark:border-dark-border shadow-sm">
                 <Button 
                   onClick={() => setActiveTab('all')}
                   variant={activeTab === 'all' ? 'default' : 'ghost'}
                   className={activeTab === 'all' ? 'bg-primary' : 'text-primary/60'}
                   size="sm"
                 >All</Button>
                 <Button 
                   onClick={() => setActiveTab('Pending')}
                   variant={activeTab === 'Pending' ? 'default' : 'ghost'}
                   className={activeTab === 'Pending' ? 'bg-amber-500 hover:bg-amber-600' : 'text-primary/60'}
                   size="sm"
                 >Pending</Button>
                 <Button 
                   onClick={() => setActiveTab('Approved')}
                   variant={activeTab === 'Approved' ? 'default' : 'ghost'}
                   className={activeTab === 'Approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-primary/60'}
                   size="sm"
                 >Approved</Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by name or email..." 
                className="h-14 pl-12 rounded-2xl border-primary-light dark:border-dark-border bg-white dark:bg-dark-card focus:ring-primary shadow-sm"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-primary/60">Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="bento-card p-20 text-center">
                <Users size={48} className="text-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold dark:text-white mb-2">No providers found</h3>
                <p className="text-primary/40">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {providers.map((p) => (
                  <div key={p.userId} className="bento-card p-6 bg-white dark:bg-dark-card flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all border border-primary-light dark:border-dark-border">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 overflow-hidden shrink-0">
                         {p.profileImageUrl ? (
                           <img src={buildImageUrl(p.profileImageUrl)} alt={p.name || p.fullName} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                             {(p.name || p.fullName || 'P').charAt(0)}
                           </div>
                         )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                           <h3 className="font-black dark:text-white truncate">{p.name || p.fullName}</h3>
                           {p.averageRating > 0 && (
                              <div className="flex items-center space-x-1 text-yellow-500 text-xs font-bold">
                                 <Star size={10} fill="currentColor" />
                                 <span>{p.averageRating}</span>
                              </div>
                           )}
                        </div>
                        <p className="text-xs text-primary/40 truncate">{p.email}</p>
                        <p className="text-[10px] text-primary/20 mt-1">Joined {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto shrink-0">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-primary/20 uppercase">Status</p>
                          {getStatusBadge(p.accountStatus)}
                       </div>

                       <div className="flex items-center space-x-2">
                          {p.accountStatus === 'Pending' && (
                            <>
                              <Button 
                                onClick={() => handleApprove(p.userId)}
                                disabled={processingId ===p.userId}
                                size="sm" 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-4 font-bold"
                              >
                                {processingId === p.userId ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="mr-2" />}
                                Approve
                              </Button>
                              <Button 
                                onClick={() => handleReject(p.userId)}
                                disabled={processingId === p.userId}
                                variant="outline" 
                                size="sm" 
                                className="border-error text-error hover:bg-error/10 rounded-xl h-10 px-4 font-bold"
                              >
                                <XCircle size={16} className="mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Link to={`/services?ProviderId=${p.userId}`}>
                             <Button variant="ghost" size="icon" className="text-primary/40 hover:text-primary">
                                <ExternalLink size={18} />
                             </Button>
                          </Link>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminProvidersPage;
