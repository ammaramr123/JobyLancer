import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi } from '@/api/adminApi';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2,
  Calendar,
  Eye,
  Mail,
  User as UserIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_CLIENTS = [
  { id: "1", fullName: "John Client", name: "John Client", email: "john@example.com", isActive: true, createdAt: "2026-01-15T10:00:00Z" },
  { id: "2", fullName: "Emma Wilson", name: "Emma Wilson", email: "emma@example.com", isActive: true, createdAt: "2026-01-20T12:30:00Z" },
  { id: "3", fullName: "Robert Brown", name: "Robert Brown", email: "robert@example.com", isActive: false, createdAt: "2026-02-10T15:45:00Z" }
];

const AdminClientsPage = () => {
  const [allClients, setAllClients] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'inactive'
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        PageSize: 1000
      };

      const res = await adminApi.getClients(params);
      const responseData = res?.data?.data;
      const items = responseData?.data || responseData;
      
      if (Array.isArray(items) && items.length > 0) {
        setAllClients(items);
      } else {
        setAllClients(MOCK_CLIENTS);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setAllClients(MOCK_CLIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    let filtered = [...allClients];
    
    if (activeTab === 'active') filtered = filtered.filter(c => c.isActive);
    if (activeTab === 'inactive') filtered = filtered.filter(c => !c.isActive);
    
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        (c.fullName || c.name || '').toLowerCase().includes(q) || 
        (c.email || '').toLowerCase().includes(q)
      );
    }
    
    setClients(filtered);
  }, [activeTab, search, allClients]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Local filtering
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
                <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">Clients</h1>
                <p className="text-primary/60 dark:text-primary-light/60">Manage platform users and account security.</p>
              </div>
              
              <div className="flex items-center space-x-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl border border-primary-light dark:border-dark-border shadow-sm">
                 <Button 
                   onClick={() => setActiveTab('all')}
                   variant={activeTab === 'all' ? 'default' : 'ghost'}
                   className={activeTab === 'all' ? 'bg-primary' : 'text-primary/60'}
                   size="sm"
                 >All</Button>
                 <Button 
                   onClick={() => setActiveTab('active')}
                   variant={activeTab === 'active' ? 'default' : 'ghost'}
                   className={activeTab === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-primary/60'}
                   size="sm"
                 >Active</Button>
                 <Button 
                   onClick={() => setActiveTab('inactive')}
                   variant={activeTab === 'inactive' ? 'default' : 'ghost'}
                   className={activeTab === 'inactive' ? 'bg-error hover:bg-error/80' : 'text-primary/60'}
                   size="sm"
                 >Inactive</Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search clients by name or email..." 
                className="h-14 pl-12 rounded-2xl border-primary-light dark:border-dark-border bg-white dark:bg-dark-card focus:ring-primary shadow-sm"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-primary/60">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="bento-card p-20 text-center">
                <Users size={48} className="text-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold dark:text-white mb-2">No clients found</h3>
                <p className="text-primary/40">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-card rounded-3xl border border-primary-light dark:border-dark-border overflow-hidden shadow-sm shadow-primary/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8F7FF] dark:bg-dark-bg border-b border-primary-light dark:border-dark-border">
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Client</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Joined</th>
                        <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-light dark:divide-dark-border">
                      {clients.map((c) => (
                        <tr key={c.id} className="hover:bg-primary/5 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                                 {c.profileImageUrl ? (
                                   <img src={buildImageUrl(c.profileImageUrl)} alt={c.name || c.fullName} className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                                     {(c.name || c.fullName || 'C').charAt(0)}
                                   </div>
                                 )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-bold dark:text-white truncate">{c.name || c.fullName}</p>
                                <p className="text-xs text-primary/40 truncate">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {c.isActive ? (
                              <div className="flex items-center text-emerald-500 font-bold transition-all">
                                <ShieldCheck size={16} className="mr-2" />
                                <span className="text-xs uppercase tracking-widest">Active</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-error font-bold transition-all">
                                <ShieldAlert size={16} className="mr-2" />
                                <span className="text-xs uppercase tracking-widest">Inactive</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center text-primary/60 dark:text-primary-light/60 text-sm">
                                <Calendar size={14} className="mr-2 opacity-40" />
                                {new Date(c.createdAt).toLocaleDateString()}
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <Button 
                               onClick={() => setSelectedClient(c)}
                               variant="ghost" 
                               size="icon" 
                               className="text-primary hover:bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <Eye size={18} />
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-dark-card rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedClient(null)}
                className="absolute top-6 right-6 text-primary/20 hover:text-primary hover:bg-primary/5 rounded-2xl"
              >
                <X size={20} />
              </Button>

              <div className="flex flex-col items-center text-center space-y-6 pt-4">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 overflow-hidden shadow-inner">
                   {selectedClient.profileImageUrl ? (
                     <img src={buildImageUrl(selectedClient.profileImageUrl)} alt={selectedClient.name || selectedClient.fullName} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-3xl text-primary font-black">
                       {(selectedClient.name || selectedClient.fullName || 'C').charAt(0)}
                     </div>
                   )}
                </div>

                <div>
                   <h2 className="text-2xl font-black text-[#1F1035] dark:text-white mb-1">{selectedClient.name || selectedClient.fullName}</h2>
                   <div className="inline-flex items-center space-x-2">
                      {selectedClient.isActive ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active Account</span>
                      ) : (
                        <span className="px-3 py-1 bg-error/10 text-error rounded-full text-[10px] font-black uppercase tracking-widest border border-error/20">Inactive Account</span>
                      )}
                   </div>
                </div>

                <div className="w-full grid grid-cols-1 gap-4 text-left">
                   <div className="p-5 bg-[#F8F7FF] dark:bg-dark-bg rounded-3xl border border-primary-light dark:border-dark-border">
                      <div className="flex items-center space-x-3 mb-4">
                         <div className="w-8 h-8 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center text-primary shadow-sm">
                            <Mail size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-primary/30 uppercase">Email Address</p>
                            <p className="font-bold dark:text-white">{selectedClient.email}</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center text-primary shadow-sm">
                            <Calendar size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-primary/30 uppercase">Join Date</p>
                            <p className="font-bold dark:text-white">{new Date(selectedClient.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <Button 
                  onClick={() => setSelectedClient(null)}
                  className="w-full bg-primary hover:bg-primary-dark text-white rounded-2xl h-14 font-black shadow-lg shadow-primary/20"
                >
                  Close Details
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

export default AdminClientsPage;
