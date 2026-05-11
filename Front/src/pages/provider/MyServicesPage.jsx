  import React, { useEffect, useState } from 'react';
  import Navbar from '@/components/shared/Navbar';
  import Footer from '@/components/shared/Footer';
  import { servicesApi } from '@/api/servicesApi';
  import { providerApi } from '@/api/providerApi';
  import { useAuthStore } from '@/store/authStore';
  import { Loader2, Plus, AlertCircle, Trash2, Edit, CheckCircle, Clock, XCircle, Lock } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { toast } from 'sonner';
  import { Link } from 'react-router-dom';
  import ServiceCard from '@/components/shared/ServiceCard';

  const SERVICE_STATUS = {
    0: { label: 'Under Review', color: 'bg-yellow-100/10 text-yellow-600 border-yellow-200/20', icon: Clock },
    1: { label: 'Live', color: 'bg-emerald-100/10 text-emerald-600 border-emerald-200/20', icon: CheckCircle },
    2: { label: 'Rejected', color: 'bg-red-100/10 text-red-600 border-red-200/20', icon: XCircle }
  };

  const MyServicesPage = () => {
    const { user } = useAuthStore();
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const providerRes = await providerApi.getMyProfile();
        const providerId = providerRes?.data?.data?.id;

        if (!providerId) throw new Error('Could not identify provider profile');

        const res = await servicesApi.getProviderServices(providerId, { Status: 1 });
        const servicesData = res?.data?.data;
        const items = Array.isArray(servicesData) ? servicesData : 
                    servicesData?.data || 
                    servicesData?.items || 
                    [];
        
        setAllServices(items);
      } catch (err) {
        console.error('Error fetching provider services:', err);
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (user) {
        fetchServices();
      }
    }, [user]);

    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
      
      try {
        setDeletingId(id);
        await servicesApi.deleteService(id);
        const filterById = (prev) => prev.filter(s => String(s.id) !== String(id));
        setAllServices(filterById);
        toast.success('Service deleted successfully');
      } catch (err) {
        console.error('Delete service error:', err);
        toast.error('Failed to delete service. Please try again.');
      } finally {
        setDeletingId(null);
      }
    };

    const sections = {
      active: allServices.filter(s => parseInt(s.status) === 1),
    };

    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
              <div>
                <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-2">My Active Services</h1>
                <p className="text-[#6B7280] dark:text-primary-light/60 font-medium">Manage your live marketplace listings.</p>
              </div>

              <Link to="/provider/services/add">
                <Button className="bg-primary hover:bg-primary-dark text-white rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                  <Plus size={16} className="mr-2" />
                  Publish New Service
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-primary/60 dark:text-primary-light/60">Inventory check in progress...</p>
              </div>
            ) : error ? (
              <div className="bento-card p-12 text-center bg-error/5 border-error/20 max-w-md mx-auto">
                <AlertCircle size={40} className="text-error mx-auto mb-4" />
                <h3 className="text-xl font-bold text-error mb-2">Sync Error</h3>
                <p className="text-primary/60 mb-6 font-medium">{error}</p>
                <Button onClick={fetchServices} className="bg-error text-white">Retry Connection</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ACTIVE SERVICES ONLY */}
                {sections.active.length === 0 ? (
                  <div className="bento-card p-20 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary-light/20 flex items-center justify-center text-primary mb-8">
                      <AlertCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold dark:text-white mb-2">No active services found</h3>
                    <p className="text-primary/60 dark:text-primary-light/60 mb-8 max-w-sm">
                      You don't have any live services at the moment. Check your profile for pending or rejected listings.
                    </p>
                    <Link to="/provider/services/add">
                      <Button className="bg-primary hover:bg-primary-dark h-12 px-8 rounded-xl font-bold">Create New Service</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.active.map((s) => (
                      <div key={s.id} className="relative group flex flex-col">
                        <ServiceCard service={s} />
                        <div className="mt-4 flex gap-2">
                          <Link to={`/provider/services/edit/${s.id}`} className="flex-1">
                              <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 rounded-xl h-10 font-bold text-xs">
                                <Edit size={14} className="mr-2" /> Edit
                              </Button>
                          </Link>
                          <Button 
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                              variant="outline" 
                              className="flex-1 border-error/20 text-error hover:bg-error/5 rounded-xl h-10 font-bold text-xs"
                          >
                              {deletingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} className="mr-2" />}
                              Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  };

  export default MyServicesPage;
