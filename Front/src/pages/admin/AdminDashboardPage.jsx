import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminApi } from '@/api/adminApi';
import { servicesApi } from '@/api/servicesApi';
import { requestApi } from '@/api/requestApi';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { buildImageUrl } from '@/lib/utils';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalProviders: 0,
    totalClients: 0,
    totalServices: 0,
    totalRequests: 0,
    pendingProviders: 0,
    pendingServices: 0
  });
  const [pendingServicesList, setPendingServicesList] = useState([]);
  const [recentRequestsList, setRecentRequestsList] = useState([]);
  const [pendingProvidersList, setPendingProvidersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [providersRes, clientsRes, servicesRes, requestsRes, pendingServicesRes, pendingProvidersRes] = await Promise.all([
        adminApi.getProviders({ PageSize: 100 }),
        adminApi.getClients({ PageSize: 100 }),
        servicesApi.getServices({ PageSize: 100 }),
        requestApi.getAdminRequests({ PageSize: 100 }),
        servicesApi.getServices({ Status: 0, PageSize: 10 }),
        adminApi.getProviders({ Status: 'Pending', PageSize: 5 })
      ]);

      const providersData = providersRes?.data?.data;
      const providers = providersData?.data ?? (Array.isArray(providersData) ? providersData : []);

      const clientsData = clientsRes?.data?.data;
      const clients = clientsData?.data ?? (Array.isArray(clientsData) ? clientsData : []);

      const servicesData = servicesRes?.data?.data;
      const services = servicesData?.data ?? (Array.isArray(servicesData) ? servicesData : []);
      
      const requestsData = requestsRes?.data?.data;
      const requests = requestsData?.data ?? (Array.isArray(requestsData) ? requestsData : []);
      
      const pendingServicesData = pendingServicesRes?.data?.data;
      const pendingServicesItems = pendingServicesData?.data ?? (Array.isArray(pendingServicesData) ? pendingServicesData : []);
      
      const recentRequests = requests.slice(0, 5);

      const pendingProvidersData = pendingProvidersRes?.data?.data;
      const pendingProvidersItems = pendingProvidersData?.data ?? (Array.isArray(pendingProvidersData) ? pendingProvidersData : []);

      setStats({
        totalProviders: providers.length,
        totalClients: clients.length,
        totalServices: services.length,
        totalRequests: requests.length,
        pendingProviders: providers.filter(p => p.accountStatus === 'Pending').length,
        pendingServices: services.filter(s => parseInt(s.status) === 0 || s.status === 'Pending').length
      });
      
      setPendingServicesList(pendingServicesItems);
      setRecentRequestsList(recentRequests);
      setPendingProvidersList(pendingProvidersItems);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveService = async (id) => {
    try {
      setActionLoading(`service-${id}`);
      await servicesApi.updateServiceStatus(id, { status: 1 });
      toast.success("Service approved successfully");
      // Optimistic update for services
      setPendingServicesList(prev => prev.filter(s => s.id !== id));
      setStats(prev => ({ ...prev, pendingServices: Math.max(0, prev.pendingServices - 1) }));
    } catch (err) {
      toast.error("Failed to approve service");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectService = async (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      setActionLoading(`service-${id}`);
      await servicesApi.updateServiceStatus(id, { status: 2, rejectionReason: reason });
      toast.success("Service rejected");
      setPendingServicesList(prev => prev.filter(s => s.id !== id));
      setStats(prev => ({ ...prev, pendingServices: Math.max(0, prev.pendingServices - 1) }));
    } catch (err) {
      toast.error("Failed to reject service");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveProvider = async (targetProviderId) => {
    // ID Integrity Guard: Ensure we have a valid provider ID string
    if (!targetProviderId || typeof targetProviderId !== 'string') {
      console.error("[ID-INTEGRITY] Invalid provider ID source detected:", targetProviderId);
      toast.error("Action aborted: Invalid provider ID source.");
      return;
    }

    try {
      setActionLoading(`provider-${targetProviderId}`);
      await adminApi.approveProvider(targetProviderId);
      toast.success("Provider approved");
      // Optimistic update using strict ID matching
      setPendingProvidersList(prev => prev.filter(p => String(p.id) !== String(targetProviderId)));
      setStats(prev => ({ ...prev, pendingProviders: Math.max(0, prev.pendingProviders - 1) }));
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error("Failed to approve provider");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProvider = async (targetProviderId) => {
    // ID Integrity Guard
    if (!targetProviderId || typeof targetProviderId !== 'string') {
      console.error("[ID-INTEGRITY] Invalid provider ID source detected during rejection:", targetProviderId);
      toast.error("Action aborted: Invalid provider ID source.");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this provider?")) return;
    try {
      setActionLoading(`provider-reject-${targetProviderId}`);
      await adminApi.rejectProvider(targetProviderId);
      toast.success("Provider rejected");
      // Optimistic update
      setPendingProvidersList(prev => prev.filter(p => String(p.id) !== String(targetProviderId)));
      setStats(prev => ({ ...prev, pendingProviders: Math.max(0, prev.pendingProviders - 1) }));
    } catch (err) {
      console.error('Reject failed:', err);
      toast.error("Failed to reject provider");
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    { label: 'Total Providers', value: stats.totalProviders, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', link: '/admin/providers' },
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/admin/clients' },
    { label: 'Total Services', value: stats.totalServices, icon: Briefcase, color: 'text-violet-500', bg: 'bg-violet-50', link: '/admin/services' },
    { label: 'Items Pending', value: stats.pendingProviders + stats.pendingServices, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', link: '/admin/services?Status=0' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="font-bold text-primary/60">Assembling command center...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          
          <AdminSidebar />

          <div className="flex-grow space-y-12">
            <div>
              <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">Admin Command Center</h1>
              <p className="text-primary/60 dark:text-primary-light/60">Real-time platform oversight and moderation.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <Link key={stat.label} to={stat.link} className="bento-card p-6 bg-white dark:bg-dark-card hover:shadow-xl transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bg} p-3 rounded-xl`}>
                      <stat.icon size={24} className={stat.color} />
                    </div>
                    <ArrowUpRight size={20} className="text-primary/20 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-[#1F1035] dark:text-white">{stat.value}</h3>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* SECTION: PENDING SERVICES */}
              <div className="bento-card p-8 bg-white dark:bg-dark-card">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Briefcase className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">Pending Services</h2>
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Needs review</p>
                    </div>
                  </div>
                  <Link to="/admin/services?Status=0">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">View All</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {pendingServicesList.length === 0 ? (
                    <div className="text-center py-12 bg-[#F8F7FF] dark:bg-dark-bg rounded-2xl border-2 border-dashed border-primary/10">
                      <p className="text-sm text-primary/40 font-bold">No services currently awaiting review</p>
                    </div>
                  ) : (
                    pendingServicesList.map((service) => (
                      <div key={service.id} className="flex flex-col p-4 bg-[#F8F7FF] dark:bg-dark-bg rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-primary-light flex items-center justify-center bg-primary/5">
                              {service.imageUrl ? (
                                <img src={buildImageUrl(service.imageUrl)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase size={20} className="text-primary/20" />
                              )}
                            </div>
                            <div>
                               <p className="font-bold dark:text-white line-clamp-1">{service.title}</p>
                               <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{service.providerName}</p>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-primary/30">
                             {new Date(service.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <Button 
                             onClick={() => handleApproveService(service.id)}
                             disabled={actionLoading === `service-${service.id}`}
                             className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                           >
                             {actionLoading === `service-${service.id}` ? <Loader2 size={14} className="animate-spin" /> : "Approve"}
                           </Button>
                           <Button 
                             onClick={() => handleRejectService(service.id)}
                             disabled={actionLoading === `service-${service.id}`}
                             variant="outline"
                             className="flex-1 border-error/20 text-error hover:bg-error/5 rounded-xl h-9 text-[10px] font-black uppercase tracking-widest"
                           >
                             {actionLoading === `service-${service.id}` ? <Loader2 size={14} className="animate-spin" /> : "Reject"}
                           </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION: RECENT REQUESTS */}
              <div className="bento-card p-8 bg-white dark:bg-dark-card">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <TrendingUp className="text-blue-500" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">Recent Requests</h2>
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Platform Pulse</p>
                    </div>
                  </div>
                  <Link to="/admin/requests">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Monitor All</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentRequestsList.length === 0 ? (
                    <div className="text-center py-12 bg-[#F8F7FF] dark:bg-dark-bg rounded-2xl border-2 border-dashed border-primary/10">
                      <p className="text-sm text-primary/40 font-bold">No activity recorded today</p>
                    </div>
                  ) : (
                    recentRequestsList.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-[#F8F7FF] dark:bg-dark-bg rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                        <div className="flex items-center space-x-4 min-w-0">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold shrink-0">
                              {request.clientName?.charAt(0)}
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold dark:text-white truncate">{request.serviceTitle}</p>
                              <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest truncate">
                                 {request.clientName} <span className="opacity-30">→</span> {request.providerName}
                              </p>
                           </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end">
                           <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase mb-1">
                              {parseInt(request.status) === 0 ? 'Pending' : 'Active'}
                           </span>
                           <span className="text-[8px] font-bold text-primary/30">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION: PENDING PROVIDERS */}
              <div className="bento-card p-8 bg-white dark:bg-dark-card xl:col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-50 rounded-lg">
                      <Users className="text-violet-500" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">Provider Onboarding</h2>
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Awaiting verification</p>
                    </div>
                  </div>
                  <Link to="/admin/providers?Status=0">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">View Pipeline</Button>
                  </Link>
                </div>

                {pendingProvidersList.length === 0 ? (
                  <div className="text-center py-12 bg-[#F8F7FF] dark:bg-dark-bg rounded-2xl border-2 border-dashed border-primary/10">
                    <p className="text-sm text-primary/40 font-bold">Onboarding queue is clear</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProvidersList.map((provider) => (
                      <div key={provider.id} className="p-6 bg-[#F8F7FF] dark:bg-dark-bg rounded-[32px] border border-transparent hover:border-primary/10 transition-all flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-600 font-black text-2xl mb-4">
                           {provider.fullName?.charAt(0)}
                        </div>
                        <h4 className="font-bold text-xl dark:text-white capitalize mb-1">{provider.fullName}</h4>
                        <p className="text-xs text-primary/40 font-medium mb-6">{provider.email}</p>
                        
                        <div className="w-full pt-6 border-t border-primary/5 mt-auto">
                           <div className="flex items-center justify-between mb-4">
                              <div className="text-left">
                                 <p className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Member Since</p>
                                 <p className="text-[10px] font-bold">{new Date(provider.createdAt || Date.now()).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex gap-2 w-full">
                              <Button 
                                onClick={() => handleApproveProvider(provider.id)}
                                disabled={actionLoading === `provider-${provider.id}`}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white rounded-xl h-10 text-[10px] font-black"
                              >
                                {actionLoading === `provider-${provider.id}` ? <Loader2 size={14} className="animate-spin" /> : "Approve"}
                              </Button>
                              <Button 
                                onClick={() => handleRejectProvider(provider.id)}
                                disabled={actionLoading === `provider-reject-${provider.id}`}
                                variant="outline"
                                className="flex-1 border-error text-error hover:bg-error/10 rounded-xl h-10 text-[10px] font-black"
                              >
                                {actionLoading === `provider-reject-${provider.id}` ? <Loader2 size={14} className="animate-spin" /> : "Reject"}
                              </Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
