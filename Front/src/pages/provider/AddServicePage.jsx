import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { categoryApi } from '@/api/categoryApi';
import { servicesApi } from '@/api/servicesApi';
import { providerApi } from '@/api/providerApi';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Loader2, Plus, ArrowLeft, Upload, 
  Info, DollarSign, Clock, CheckCircle2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AddServicePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deliveryDays: '',
    categoryId: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdService, setCreatedService] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [providerLoading, setProviderLoading] = useState(true);

  useEffect(() => {
    const fetchProviderStatus = async () => {
      try {
        setProviderLoading(true);
        const res = await providerApi.getMyProfile();
        const status = res?.data?.data?.accountStatus;
        setAccountStatus(status);
        
        // If rejected, redirect after a short delay or stay to show message
        if (status === 'Rejected') {
           toast.error("Your account has been rejected as a provider.");
        }
      } catch (err) {
        console.error('Error fetching provider status:', err);
      } finally {
        setProviderLoading(false);
      }
    };
    fetchProviderStatus();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      deliveryDays: '',
      categoryId: '',
    });
    setSelectedFiles([]);
    setPreviews([]);
    setIsSuccess(false);
    setCreatedService(null);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories({ PageSize: 100 });
        const responseData = res?.data?.data;
        const items = Array.isArray(responseData) 
          ? responseData 
          : responseData?.data || [];
        setCategories(items);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      
      const data = new FormData();
      data.append('CategoryId', formData.categoryId);
      data.append('Title', formData.title);
      data.append('Description', formData.description);
      data.append('Price', formData.price);
      data.append('DeliveryDays', formData.deliveryDays);
      
      selectedFiles.forEach((file) => {
        data.append('Images', file);
      });

      const res = await servicesApi.createService(data);
      setCreatedService({
        title: formData.title,
        price: formData.price,
        id: res?.data?.data?.id
      });
      setIsSuccess(true);
      toast.success("Service submitted for approval");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create service.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bento-card p-12 text-center bg-white dark:bg-dark-card shadow-2xl">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              
              <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-4">Service Submitted Successfully!</h1>
              <p className="text-primary/60 dark:text-primary-light/60 text-lg mb-10">
                Your service <span className="font-bold text-primary dark:text-white">"{createdService?.title}"</span> has been captured. It is now awaiting review from our moderation team.
              </p>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 mb-12 flex flex-col items-center">
                 <div className="flex items-center space-x-2 text-amber-600 mb-2">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Status</span>
                 </div>
                 <div className="bg-amber-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                    Status: Pending Admin Approval
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/provider/profile" className="flex-1">
                  <Button className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">
                    View My Pending Services
                  </Button>
                </Link>
                <Button 
                   onClick={resetForm}
                   variant="outline" 
                   className="flex-1 h-14 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Add Another Service
                </Button>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (providerLoading) {
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

  // Not Approved UI
  const isApproved = accountStatus === 'Approved' || accountStatus === '1';
  
  if (!isApproved) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="max-w-2xl w-full bento-card p-12 text-center">
            {accountStatus === 'Rejected' ? (
              <>
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center text-error mx-auto mb-6">
                  <X size={40} />
                </div>
                <h1 className="text-3xl font-black text-[#1F1035] dark:text-white mb-4">Account Rejected</h1>
                <p className="text-primary/60 dark:text-primary-light/60 text-lg mb-8">
                  Your account has been rejected. Please contact support to resolve this issue.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
                  <Clock size={40} />
                </div>
                <h1 className="text-3xl font-black text-[#1F1035] dark:text-white mb-4">Approval Pending</h1>
                <p className="text-primary/60 dark:text-primary-light/60 text-lg mb-8">
                  Your account is pending admin approval. You cannot add services until your account is approved.
                </p>
              </>
            )}
            <Button onClick={() => navigate('/provider/profile')} className="bg-primary hover:bg-primary-dark rounded-xl h-12 px-8 font-bold">
              Return to Profile
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-8 text-primary/60 hover:text-primary rounded-xl"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>

          <div className="mb-12">
            <h1 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tight mb-4 flex items-center">
              <Plus className="mr-4 text-primary" size={40} />
              Publish New Service
            </h1>
            <p className="text-[#6B7280] dark:text-primary-light/60 text-lg">Define your expertise and start reaching thousands of potential clients.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
              {/* General Info */}
              <div className="bento-card p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                  <Info size={20} className="mr-3 text-primary" />
                  Service Narrative
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Service Title</label>
                    <input 
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. I will design a modern minimalist logo for your startup"
                      className="w-full h-14 px-5 rounded-2xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Comprehensive Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Tell clients what exactly you offer and why they should choose you..."
                      className="w-full h-48 p-5 rounded-2xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="bento-card p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                  <Upload size={20} className="mr-3 text-primary" />
                  Visual Gallery
                </h2>
                
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-primary-light dark:border-dark-border rounded-[32px] p-8 text-center flex flex-col items-center justify-center group hover:border-primary/50 transition-colors cursor-pointer mb-6"
                >
                   <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                   </div>
                   <p className="font-bold text-[#1F1035] dark:text-white mb-2">Click to select images</p>
                   <p className="text-sm text-primary/40 dark:text-primary-light/40">Select up to 5 project images</p>
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-primary-light dark:border-dark-border group">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="md:col-span-4 space-y-8">
              <div className="bento-card p-8 bg-white dark:bg-dark-card sticky top-24">
                <h2 className="text-lg font-bold mb-6 dark:text-white">Service Controls</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Classification</label>
                    <select 
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Base Price ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                      <input 
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Delivery (Days)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                      <input 
                        type="number"
                        name="deliveryDays"
                        value={formData.deliveryDays}
                        onChange={handleChange}
                        required
                        placeholder="3"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all font-mono"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <div className="flex items-center">
                        <CheckCircle2 size={18} className="mr-2" />
                        Publish Service
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddServicePage;
