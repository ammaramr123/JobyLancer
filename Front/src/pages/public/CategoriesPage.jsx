import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { motion } from 'motion/react';
import { Rocket, Sparkles, Globe, Shield, ArrowRight, Code, Palette, BarChart, Camera, Music, Video, MessageSquare, Loader2, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoryApi } from '@/api/categoryApi';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryApi.getCategories();
        const responseData = res?.data?.data;
        
        // Handle paginated response: data.data is the array, or data itself if it's a direct array
        const items = Array.isArray(responseData) 
          ? responseData 
          : (Array.isArray(responseData?.data) ? responseData.data : []);
        
        setCategories(items);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="pt-20 pb-16 border-b border-[#E5E7EB] dark:border-dark-border">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-[#1F1035] dark:text-white">
                Explore <span className="text-primary italic">Expertise</span>
              </h1>
              <p className="text-xl text-[#6B7280] dark:text-primary-light/70 max-w-2xl mx-auto">
                Discover specialized talent across all digital disciplines. Our providers are vetted for quality and reliability.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-error font-medium py-20">{error}</div>
            ) : categories.length === 0 ? (
              <div className="text-primary/60 dark:text-primary-light/60 py-20">No categories found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/services?CategoryName=${encodeURIComponent(cat.name)}`} className="bento-card group flex flex-col p-10 h-full hover:border-primary/50 text-left">
                      <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-black/5 group-hover:rotate-6 transition-transform duration-300 overflow-hidden">
                        {cat.iconUrl && cat.iconUrl.startsWith('http') ? (
                          <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-contain p-2 bg-white" />
                        ) : (
                          <span className="text-3xl">{cat.iconUrl || <Briefcase size={30} />}</span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-[#1F1035] dark:text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-[#6B7280] dark:text-primary-light/70 text-sm leading-relaxed mb-8">
                        Explore specialized services in {cat.name}. Connect with top-tier practitioners today.
                      </p>
                      
                      <div className="mt-auto flex items-center text-primary font-bold text-sm uppercase tracking-widest group-hover:gap-2 transition-all">
                        <span>Browse Services</span>
                        <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Don't see what you're looking for?</h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Our network is growing every day. Search all services or contact our help center for specialized requests.
            </p>
            <div className="flex justify-center">
              <Link to="/services">
                <button className="h-14 px-10 bg-white text-primary font-bold rounded-xl hover:bg-primary-light transition-all shadow-xl">
                  Search All Services
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoriesPage;
