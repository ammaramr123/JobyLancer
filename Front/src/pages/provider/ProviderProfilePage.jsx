import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { providerApi } from '@/api/providerApi';
import { servicesApi } from '@/api/servicesApi';
import { requestApi } from '@/api/requestApi';
import { buildImageUrl } from '@/lib/utils';
import { motion } from 'motion/react';
import { 
  Loader2, User, Star, Settings, 
  Briefcase, DollarSign, Shield, LogOut,
  Plus, Edit3, ChevronRight, MessageSquare,
  Check, X, Camera, Info, XCircle, Clock, Lock, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import ServiceCard from '@/components/shared/ServiceCard';
import { toast } from 'sonner';

const ProviderProfilePage = () => {
  const { user, logout } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [myServices, setMyServices] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ fullName: '', profileImageUrl: '', bio: '', portfolioLink: '' });
  const [pendingServices, setPendingServices] = useState([]);
  const [rejectedServices, setRejectedServices] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const getAccountStatusBadge = (status) => {
    const s = status?.toString();
    switch (s) {
      case '0':
      case 'Pending':
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20 ml-3">Pending Review</span>;
      case '1':
      case 'Approved':
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 ml-3">Approved</span>;
      case '2':
      case 'Rejected':
        return <span className="px-3 py-1 bg-error/10 text-error rounded-lg text-[10px] font-black uppercase tracking-widest border border-error/20 ml-3">Rejected</span>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const profileRes = await providerApi.getMyProfile();
        const data = profileRes?.data?.data;
        const providerId = data?.id;
        
        if (data && providerId) {
          const fullImageUrl = buildImageUrl(data.profileImageUrl);
          setProfile({
            ...data,
            fullName: data.name || data.fullName,
            profileImageUrl: fullImageUrl
          });
          setEditValues({ 
            fullName: data.name || data.fullName, 
            profileImageUrl: fullImageUrl || '', 
            bio: data.bio || '',
            portfolioLink: data.portfolioLink || ''
          });
          
          // Fetch services in parallel with explicit status filters
          const [activeRes, pendingRes, rejectedRes, requestsRes] = await Promise.all([
            servicesApi.getProviderServices(providerId, { Status: 1 }),
            servicesApi.getProviderServices(providerId, { Status: 0 }),
            servicesApi.getProviderServices(providerId, { Status: 2 }),
            requestApi.getProviderRequests()
          ]);

          const extractItems = (res) => {
            const d = res?.data?.data;
            return Array.isArray(d) ? d : (d?.data || d?.items || []);
          };
          
          setMyServices(extractItems(activeRes));
          setPendingServices(extractItems(pendingRes));
          setRejectedServices(extractItems(rejectedRes));
          setIncomingRequests(extractItems(requestsRes).filter(r => r.status === 'Pending').slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
       fetchData();
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      setDeletingId(id);
      await servicesApi.deleteService(id);
      
      const filterById = (prev) => prev.filter(s => String(s.id) !== String(id));
      
      setRejectedServices(filterById);
      setMyServices(filterById);
      setPendingServices(filterById);
      
      toast.success('Service deleted');
    } catch (err) {
      console.error('Delete service error:', err);
      toast.error('Failed to delete service. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('FullName', editValues.fullName);
      formData.append('Bio', editValues.bio);
      formData.append('PortfolioLink', editValues.portfolioLink);
      
      if (imageFile) {
        formData.append('ProfilePicture', imageFile);
      }

      const res = await providerApi.updateProfile(formData);
      const updatedData = res?.data?.data;
      
      if (updatedData) {
        const { updateUser } = useAuthStore.getState();
        const fullImageUrl = buildImageUrl(updatedData.profileImageUrl || updatedData.profilePicture);
        
        updateUser({ 
          fullName: updatedData.name || updatedData.fullName, 
          profileImageUrl: fullImageUrl
        });
        
        setProfile({
          ...updatedData,
          fullName: updatedData.name || updatedData.fullName,
          profileImageUrl: fullImageUrl
        });
        
        setEditValues({
          fullName: updatedData.name || updatedData.fullName,
          profileImageUrl: fullImageUrl || '',
          bio: updatedData.bio || '',
          portfolioLink: updatedData.portfolioLink || ''
        });
        
        toast.success('Profile updated successfully');
      }
      
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update profile. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      setDeleting(true);
      await providerApi.deleteAccount();
      logout();
    } catch (err) {
      console.error('Delete account failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bento-card p-12 text-center max-w-md bg-error/5 border-error/20">
            <Shield size={48} className="text-error mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-error mb-2">Profile Error</h2>
            <p className="text-primary/60 mb-8">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary-dark">
               Retry Loading
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Status Banners */}
          {(profile?.accountStatus === 'Pending' || profile?.accountStatus === '0') && (
            <div className="mb-8 p-6 bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl flex items-center text-amber-600 font-bold shadow-lg shadow-amber-500/5">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mr-4 shrink-0">
                  <Clock size={24} />
               </div>
               <p className="text-lg">Your account is pending admin approval. You cannot add services until approved.</p>
            </div>
          )}
          {(profile?.accountStatus === 'Rejected' || profile?.accountStatus === '2') && (
            <div className="mb-8 p-6 bg-error/10 border-2 border-error/20 rounded-3xl flex items-center text-error font-bold shadow-lg shadow-error/5">
                <div className="w-12 h-12 rounded-2xl bg-error/20 flex items-center justify-center mr-4 shrink-0">
                  <XCircle size={24} />
               </div>
               <p className="text-lg">Your account has been rejected. Please contact support.</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Stats & Info */}
            <div className="lg:w-80 shrink-0">
              <div className="bento-card p-8 text-center sticky top-24">
                <div className="relative inline-block mb-6 group">
                  <div className="w-32 h-32 rounded-[32px] bg-primary/10 border-4 border-white dark:border-dark-card shadow-2xl flex items-center justify-center text-primary overflow-hidden">
                    {imagePreview || profile?.profileImageUrl ? (
                      <img 
                        src={imagePreview || profile?.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${imagePreview || profile?.profileImageUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20`}>
                      <User size={64} strokeWidth={1.5} />
                    </div>
                  </div>
                   <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                   />
                   <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                   >
                      <Camera size={18} />
                   </button>
                </div>
                
                {isEditing ? (
                  <div className="mb-4 space-y-3">
                    <input 
                      type="text"
                      value={editValues.fullName}
                      onChange={(e) => setEditValues({ ...editValues, fullName: e.target.value })}
                      className="w-full p-2 text-center rounded-lg border-2 border-primary/20 bg-white dark:bg-dark-bg dark:text-white focus:border-primary outline-none"
                      placeholder="Full Name"
                    />
                    <input 
                      type="text"
                      value={editValues.portfolioLink}
                      onChange={(e) => setEditValues({ ...editValues, portfolioLink: e.target.value })}
                      className="w-full p-2 text-center rounded-lg border-2 border-primary/20 bg-white dark:bg-dark-bg dark:text-white focus:border-primary outline-none text-sm"
                      placeholder="Portfolio Link"
                    />
                    <textarea 
                      value={editValues.bio}
                      onChange={(e) => setEditValues({ ...editValues, bio: e.target.value })}
                      className="w-full p-2 text-sm rounded-lg border-2 border-primary/20 bg-white dark:bg-dark-bg dark:text-white focus:border-primary outline-none"
                      placeholder="Your bio..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      </Button>
                      <Button onClick={() => { 
                        setIsEditing(false); 
                        setImageFile(null);
                        setImagePreview(null);
                        setEditValues({ 
                          fullName: profile?.fullName || '', 
                          profileImageUrl: profile?.profileImageUrl || '', 
                          bio: profile?.bio || '',
                          portfolioLink: profile?.portfolioLink || ''
                        }); 
                      }} className="flex-1 bg-error hover:bg-error/80">
                        <X size={18} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-1">
                      <h1 className="text-2xl font-black text-[#1F1035] dark:text-white">{profile?.fullName}</h1>
                      {getAccountStatusBadge(profile?.accountStatus)}
                    </div>
                    <p className="text-sm font-bold text-accent uppercase tracking-widest mb-6">Pro Freelancer</p>
                  </>
                )}
                
                <div className="flex flex-col gap-3">
                  {/* Only show Add Service button if approved (Status Approved or 1) */}
                  {(profile?.accountStatus === 'Approved' || profile?.accountStatus === '1') && (
                    <Link to="/provider/services/add">
                      <Button className="w-full h-12 bg-primary hover:bg-primary-dark rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                         <Plus size={18} className="mr-2" />
                         New Service
                      </Button>
                    </Link>
                  )}
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline" 
                      className="w-full h-12 border-primary-light dark:border-dark-border hover:bg-primary/5 rounded-xl font-bold"
                    >
                      Edit Profile
                    </Button>
                  )}
                  
                  {/* COMPACT INCOMING INQUIRIES IN SIDEBAR */}
                  <div className="mt-6 text-left">
                    <div className="flex items-center justify-between mb-4 px-1">
                       <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Inquiries</p>
                       <Link to="/provider/requests" className="text-[10px] font-black text-primary hover:underline">View All</Link>
                    </div>
                    
                    {incomingRequests.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-primary/5 border border-dashed border-primary/10 text-center">
                        <p className="text-[9px] font-bold text-primary/30 uppercase">Inbox Clear</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {incomingRequests.map(req => (
                          <Link key={req.id} to="/provider/requests" className="flex items-center p-3 bg-white dark:bg-dark-bg border border-primary-light dark:border-dark-border rounded-xl hover:border-primary transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 mr-3">
                              {req.clientName?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="text-[11px] font-bold dark:text-white truncate group-hover:text-primary transition-colors">{req?.serviceTitle || 'N/A'}</p>
                              <p className="text-[8px] font-medium text-primary/40 truncate">{req?.clientName || 'Anonymous'}</p>
                            </div>
                            <ChevronRight size={12} className="text-primary/20 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="w-full h-12 text-primary hover:bg-primary/5 rounded-xl font-bold mt-4"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="w-full h-12 text-error hover:bg-error/10 rounded-xl font-bold mt-2"
                  >
                    {deleting ? <Loader2 size={18} className="animate-spin mr-2" /> : <X size={18} className="mr-2" />}
                    Delete Account
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-primary-light dark:border-dark-border grid grid-cols-2 gap-4">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Rating</p>
                      <div className="flex items-center justify-center text-yellow-500 font-bold">
                         <Star size={14} fill="currentColor" className="mr-1" />
                         {profile?.averageRating || '0.0'}
                      </div>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Reviews</p>
                      <p className="font-black dark:text-white">{profile?.totalReviews || '0'}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow space-y-12">
              
              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bento-card p-6 bg-white dark:bg-dark-card border-l-4 border-l-primary">
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-2">Total Earnings</p>
                    <h3 className="text-3xl font-black dark:text-white">$14,250</h3>
                 </div>
                 <div className="bento-card p-6 bg-white dark:bg-dark-card border-l-4 border-l-accent">
                    <p className="text-[10px] font-black text-accent/40 uppercase tracking-widest mb-2">Active Projects</p>
                    <h3 className="text-3xl font-black dark:text-white">8</h3>
                 </div>
                 <div className="bento-card p-6 bg-white dark:bg-dark-card border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-2">Completed</p>
                    <h3 className="text-3xl font-black dark:text-white">116</h3>
                 </div>
              </div>

                {/* Active Services */}
              <div>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-[#1F1035] dark:text-white tracking-tight">Active Services</h2>
                    <Link to="/provider/services">
                       <Button size="sm" variant="ghost" className="text-primary font-bold">Manage All <ChevronRight size={16} /></Button>
                    </Link>
                 </div>
                 
                 {myServices.length === 0 ? (
                    <div className="bento-card p-12 text-center bg-primary-light/5 border-dashed">
                       <p className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">No active services</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {myServices.map(service => (
                          <div key={service.id} className="relative group">
                             <ServiceCard service={service} showStatus={true} />
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Pending Services */}
              <div>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-[#1F1035] dark:text-white tracking-tight">Pending Approval</h2>
                 </div>
                 
                 {pendingServices.length === 0 ? (
                    <div className="bento-card p-10 text-center bg-[#F8F7FF] dark:bg-dark-bg/30 border-dashed">
                       <p className="text-primary/40 font-bold text-[10px] uppercase tracking-widest">No pending reviews</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {pendingServices.map(service => (
                          <div key={service.id} className="bento-card p-4 bg-amber-500/5 border-amber-500/10 flex flex-col">
                             <div className="relative aspect-video rounded-xl overflow-hidden mb-4 grayscale-[0.5] opacity-80">
                                <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-amber-500 text-white p-2 rounded-xl shadow-lg border border-white/20">
                                   <Clock size={16} />
                                </div>
                             </div>
                             <h4 className="font-bold dark:text-white mb-2">{service?.title}</h4>
                             <p className="text-xs text-amber-600 font-black uppercase tracking-widest mb-4">Pending Admin Approval</p>
                             <div className="mt-auto p-3 bg-white dark:bg-dark-bg rounded-xl border border-amber-200/20 text-[10px] text-amber-700/60 font-medium">
                                "This service is under review. You'll be notified once approved."
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Rejected Services */}
              <div>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-[#1F1035] dark:text-white tracking-tight">Action Required</h2>
                 </div>
                 
                 {rejectedServices.length === 0 ? (
                    <div className="bento-card p-10 text-center bg-[#F8F7FF] dark:bg-dark-bg/30 border-dashed">
                       <p className="text-primary/40 font-bold text-[10px] uppercase tracking-widest">No rejected services</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {rejectedServices.map(service => (
                          <div key={service.id} className="bento-card p-4 bg-error/5 border-error/20 flex flex-col">
                             <div className="relative aspect-video rounded-xl overflow-hidden mb-4 grayscale opacity-60">
                                <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-error text-white p-2 rounded-xl shadow-lg border border-white/20">
                                   <XCircle size={16} />
                                </div>
                             </div>
                             <h4 className="font-bold dark:text-white mb-2">{service?.title}</h4>
                             <p className="text-xs text-error font-black uppercase tracking-widest mb-4">Rejected</p>
                             <div className="p-3 bg-white dark:bg-dark-bg rounded-xl border border-error/10 text-[10px] text-error/60 font-medium line-clamp-2 mb-4">
                                {service?.rejectionReason || "Information provided was insufficient or violated policies."}
                             </div>
                             <Button 
                                onClick={() => handleDeleteService(service.id)}
                                disabled={deletingId === service.id}
                                variant="outline" 
                                className="w-full border-error/20 text-error hover:bg-error/5 rounded-xl h-10 font-bold text-xs"
                             >
                                {deletingId === service.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} className="mr-2" />}
                                Remove Listing
                             </Button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Bio & Skills */}
              <div className="bento-card p-8">
                 <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                    <Settings size={24} className="mr-3 text-primary" />
                    Professional Bio
                 </h2>
                 <p className="text-[#6B7280] dark:text-primary-light/80 leading-relaxed mb-8 italic">
                   "{profile?.bio || 'No bio provided yet.'}"
                 </p>
                 
                 <div className="flex flex-wrap gap-2">
                    {profile?.skills?.map(skill => (
                       <span key={skill} className="px-4 py-1.5 bg-primary-light/50 dark:bg-dark-bg border border-primary-light dark:border-dark-border rounded-xl text-primary dark:text-primary-light text-xs font-bold uppercase tracking-widest">
                          {skill}
                       </span>
                    ))}
                 </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderProfilePage;
