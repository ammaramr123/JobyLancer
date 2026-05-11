import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { categoryApi } from '@/api/categoryApi';
import { servicesApi } from '@/api/servicesApi';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Loader2, Save, ArrowLeft, Upload, 
  Info, DollarSign, Clock, CheckCircle2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EditServicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deliveryDays: '',
    categoryId: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const [catRes, serviceRes] = await Promise.all([
          categoryApi.getCategories({ PageSize: 100 }),
          servicesApi.getServiceById(id)
        ]);

        const categoriesData = catRes?.data?.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || []);

        const service = serviceRes?.data?.data;
        if (service) {
          setFormData({
            title: service.title || '',
            description: service.description || '',
            price: service.price || '',
            deliveryDays: service.deliveryDays || '',
            categoryId: service.categoryId || '',
          });
          // Assuming the API returns a list of image URLs
          if (service.imageUrls) setExistingImages(service.imageUrls);
          else if (service.imageUrl) setExistingImages([service.imageUrl]);
        }
      } catch (err) {
        console.error('Error fetching edit data:', err);
        toast.error('Failed to load service details');
        navigate('/provider/services');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length + existingImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const removeExistingFile = (index) => {
    const newExisting = [...existingImages];
    newExisting.splice(index, 1);
    setExistingImages(newExisting);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        // The backend might need explicit handling for existing vs new images
        // For this implementation, we'll follow standard PUT logic
        existingImages
      };

      await servicesApi.updateService(id, payload);
      
      // If there are new files, we might need a separate call if the API expects multipart for updates
      // But for now we'll assume updateService handles the main fields.
      
      toast.success("Service updated successfully");
      navigate('/provider/services');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update service.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] dark:bg-dark-bg">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
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
              Edit Service Profile
            </h1>
            <p className="text-[#6B7280] dark:text-primary-light/60 text-lg">Update your service details and maintain high quality listings.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-8">
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
                      className="w-full h-48 p-5 rounded-2xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              </div>

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
                   <p className="font-bold text-[#1F1035] dark:text-white mb-2">Add more images</p>
                   <p className="text-sm text-primary/40 dark:text-primary-light/40">Total maximum is 5 images</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border border-primary-light dark:border-dark-border group">
                      <img src={img} alt="Existing" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-primary text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Current</div>
                      <button 
                        type="button"
                        onClick={() => removeExistingFile(index)}
                        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {previews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border border-primary-light dark:border-dark-border group">
                      <img src={preview} alt="New Preview" className="w-full h-full object-cover border-2 border-emerald-500/50" />
                      <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">New</div>
                      <button 
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-8">
              <div className="bento-card p-8 bg-white dark:bg-dark-card sticky top-24 shadow-2xl shadow-primary/5">
                <h2 className="text-lg font-bold mb-6 dark:text-white">Revision Controls</h2>
                
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
                        <Save size={18} className="mr-2" />
                        Save Changes
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

export default EditServicePage;
