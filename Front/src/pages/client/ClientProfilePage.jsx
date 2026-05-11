import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { clientApi } from '@/api/clientApi';
import { buildImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, User, Mail, Settings, 
  Package, Heart, Shield, LogOut,
  Camera, Edit3, Trash2, Check, X, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const ClientProfilePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ fullName: '', profileImageUrl: '' });
  const [saving, setSaving] = useState(false);

  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await clientApi.getMyProfile();
      const data = res?.data?.data;
      if (data) {
        const fullImageUrl = buildImageUrl(data.profileImageUrl);
        
        setProfile({ 
          ...data, 
          fullName: data.name || data.fullName,
          profileImageUrl: fullImageUrl
        });
        setEditValues({ 
          fullName: data.name || data.fullName, 
          profileImageUrl: fullImageUrl || '' 
        });
      } else {
        setError('Profile data not found.');
      }
    } catch (err) {
      console.error('API error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpdate = async () => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('FullName', editValues.fullName);
      
      if (imageFile) {
        // Swagger says 'ProfileImageUrl' is the correct field for file upload on Client
        formData.append('ProfileImageUrl', imageFile);
      }

      const res = await clientApi.updateProfile(formData);
      const updatedData = res?.data?.data;
      
      if (updatedData) {
        const fullImageUrl = buildImageUrl(updatedData.profileImageUrl);

        const { updateUser } = useAuthStore.getState();
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
          profileImageUrl: fullImageUrl || ''
        });
      }
      
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
      try {
        await clientApi.deleteAccount();
        logout();
        navigate('/');
      } catch (err) {
        console.error('Delete failed:', err);
        // Fallback for demo
        logout();
        navigate('/');
      }
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
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
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      </Button>
                      <Button onClick={() => { 
                        setIsEditing(false); 
                        setImageFile(null);
                        setImagePreview(null);
                        setEditValues({ fullName: profile.fullName, profileImageUrl: profile.profileImageUrl || '' }); 
                      }} className="flex-1 bg-error hover:bg-error/80">
                        <X size={18} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-black text-[#1F1035] dark:text-white mb-1">{profile?.fullName}</h1>
                    <p className="text-sm font-bold text-primary/40 dark:text-primary-light/40 uppercase tracking-widest mb-6">Verified Client</p>
                  </>
                )}
                
                <div className="flex flex-col gap-3">
                  <Link to="/client/requests">
                    <Button className="w-full h-12 bg-primary hover:bg-primary-dark rounded-xl font-bold">
                       My Requests
                    </Button>
                  </Link>
                  {!isEditing && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline" 
                      className="w-full h-12 border-primary-light dark:border-dark-border hover:bg-primary/5 rounded-xl font-bold"
                    >
                      Edit Profile
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="w-full h-12 text-primary/60 hover:bg-primary/5 rounded-xl font-bold"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                  
                  <button 
                    onClick={handleDelete}
                    className="flex items-center justify-center space-x-2 text-[10px] text-error/50 hover:text-error transition-colors mt-8 font-black uppercase tracking-tighter"
                  >
                    <Trash2 size={12} />
                    <span>Terminate Account</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Profile Tabs */}
            <div className="flex-grow space-y-8">
              {/* Account Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bento-card p-8 bg-[#7C3AED] text-white">
                    <Package className="mb-4" size={32} />
                    <h3 className="text-3xl font-black mb-1">{profile?.totalOrders || 0}</h3>
                    <p className="text-white/80 font-bold uppercase text-xs tracking-widest">Total Orders</p>
                    <Link to="/client/requests" className="mt-8 flex items-center text-white font-bold group inline-block">
                       Track History <Edit3 size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </div>
                 <div className="bento-card p-8 bg-[#06B6D4] text-white">
                    <Heart className="mb-4" size={32} />
                    <h3 className="text-3xl font-black mb-1">{profile?.savedServices || 0}</h3>
                    <p className="text-white/80 font-bold uppercase text-xs tracking-widest">Saved Services</p>
                    <Link to="/services" className="mt-8 flex items-center text-white font-bold group inline-block">
                       Explore More <Edit3 size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </div>
              </div>

              {/* Personal Details */}
              <div className="bento-card p-8">
                 <h2 className="text-xl font-bold mb-8 dark:text-white flex items-center">
                    <Settings name="settings" size={24} className="mr-3 text-primary" />
                    Account Security
                 </h2>
                 
                 <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-primary-light dark:border-dark-border">
                       <div>
                          <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Email</p>
                          <p className="font-bold dark:text-white">{profile?.email}</p>
                       </div>
                       <Shield className="text-emerald-500" size={20} />
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-primary-light dark:border-dark-border">
                       <div>
                          <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Member Since</p>
                          <p className="font-bold dark:text-white">{profile?.joinDate || "March 2024"}</p>
                       </div>
                       <Package className="text-primary/20" size={20} />
                    </div>
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

export default ClientProfilePage;
