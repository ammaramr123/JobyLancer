import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ServiceCard from '@/components/shared/ServiceCard';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Search, CreditCard, Sparkles, Loader2, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryApi } from '@/api/categoryApi';
import { servicesApi } from '@/api/servicesApi';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, serRes] = await Promise.all([
          categoryApi.getCategories().catch(() => ({ data: { data: [] } })),
          servicesApi.getServices({ Status: 1, PageSize: 8 }).catch(() => ({ data: { data: [] } }))
        ]);
        
        const catResponse = catRes?.data?.data;
        const serResponse = serRes?.data?.data;
        
        const catItems = Array.isArray(catResponse) ? catResponse : (catResponse?.data || []);
        const serItems = Array.isArray(serResponse) ? serResponse : (serResponse?.data || []);

        setCategories(catItems);
        setFeaturedServices(serItems);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setCategories([]);
        setFeaturedServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?Search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow">
        {/* Modern Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b border-primary-light dark:border-dark-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(124,58,237,0.1),transparent)] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-primary-light/50 dark:bg-primary-dark/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm"
              >
                <Sparkles size={16} />
                <span>Modern Freelancing Reimagined</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-6xl md:text-8xl font-extrabold leading-[1.05] tracking-tight text-[#1F1035] dark:text-white mb-8 max-w-5xl"
              >
                Scale your vision with <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">top 1%</span> talent.
              </motion.h1>
              
              <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.7, delay: 0.2 }}
                 className="text-lg md:text-xl text-[#6B7280] dark:text-primary-light/70 mb-12 max-w-2xl leading-relaxed"
              >
                The ultimate platform for founders and businesses to hire verified experts across design, engineering, and digital strategy.
              </motion.p>
              
              {/* Search Bar */}
              <motion.form 
                 onSubmit={handleSearch}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.7, delay: 0.3 }}
                 className="w-full max-w-2xl relative mb-12"
              >
                <div className="relative flex items-center">
                  <Search className="absolute left-6 text-primary/40 dark:text-white/40" size={24} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for any service..."
                    className="w-full h-16 pl-16 pr-32 rounded-2xl bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border shadow-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white text-lg"
                  />
                  <Button type="submit" className="absolute right-2 top-2 h-12 px-8 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg transition-transform active:scale-95">
                    Search
                  </Button>
                </div>
              </motion.form>

              {/* Stat Bento Overview */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl"
              >
                {[
                  { label: "Talent", value: "12k+", icon: User },
                  { label: "Retention", value: "94%", icon: Shield },
                  { label: "Payouts", value: "$4.8m", icon: CreditCard },
                  { label: "Success", value: "99%", icon: Star }
                ].map((stat, i) => (
                  <div key={i} className="bento-card p-6 flex flex-col items-center justify-center group">
                    <stat.icon className="text-primary/40 mb-3 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-2xl font-black dark:text-white">{stat.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-white/50 dark:bg-dark-bg/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-black mb-4 text-[#1F1035] dark:text-white">Built for every industry.</h2>
                <p className="text-[#6B7280] dark:text-primary-light/60">From silicon valley startups to local agencies.</p>
              </div>
              <Link to="/categories" className="text-primary font-bold hover:underline flex items-center mb-1">
                View All <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 bg-primary-light/20 rounded-[32px] animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/services?CategoryName=${encodeURIComponent(category.name)}`}
                    className="bento-card p-10 group cursor-pointer hover:border-primary/50 text-center transition-all bg-white dark:bg-dark-card flex flex-col items-center justify-center min-h-[220px]"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">
                      {category.iconUrl && category.iconUrl.startsWith('http') ? (
                        <img src={category.iconUrl} alt={category.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-5xl">{category.iconUrl || "💼"}</span>
                      )}
                    </div>
                    <h3 className="text-base font-black dark:text-white uppercase tracking-tight">{category.name}</h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Services */}
        <section className="py-24">
          <div className="container mx-auto px-4">
             <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-black mb-4 text-[#1F1035] dark:text-white">Elite Service Catalog.</h2>
                <p className="text-[#6B7280] dark:text-primary-light/60">Triple-vetted talent for high-impact results.</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 bg-primary-light/20 rounded-[32px] animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
