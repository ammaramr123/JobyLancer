import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ServiceCard from '@/components/shared/ServiceCard';
import { categoryApi } from '@/api/categoryApi';
import { servicesApi } from '@/api/servicesApi';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    Search: searchParams.get('Search') || '',
    CategoryId: searchParams.get('CategoryId') || '',
    CategoryName: searchParams.get('CategoryName') || '',
    MinPrice: searchParams.get('MinPrice') || '',
    MaxPrice: searchParams.get('MaxPrice') || '',
    PageIndex: parseInt(searchParams.get('PageIndex') || '1'),
    PageSize: 12
  });

  const fetchServices = useCallback(async (currentFilters) => {
    console.log('fetchServices called with:', currentFilters);
    try {
      setLoading(true);
      setError(null);


      const params = {
        PageIndex: currentFilters.PageIndex,
        PageSize: currentFilters.PageSize
      };

      if (currentFilters.MinPrice && Number(currentFilters.MinPrice) > 0) params.MinPrice = currentFilters.MinPrice;
      if (currentFilters.MaxPrice && Number(currentFilters.MaxPrice) > 0) params.MaxPrice = currentFilters.MaxPrice;
      if (currentFilters.Search) params.Search = currentFilters.Search;

      const categoryNameParam = currentFilters.CategoryName;

      // Handle CategoryName logic sequentially if categories aren't loaded
      if (categoryNameParam && categories.length === 0) {
        // Fetch categories first to get the id
        const catRes = await categoryApi.getCategories({ PageSize: 100 });
        const catResponse = catRes?.data?.data;
        const cats = Array.isArray(catResponse) ? catResponse : (catResponse?.data || []);
        setCategories(cats);

        const matched = cats.find(c =>
          c.name.toLowerCase() === categoryNameParam.toLowerCase()
        );

        if (matched) {
          params.CategoryId = matched.id;
        }
        console.log('params being sent:', params);
        const res = await servicesApi.getServices({ ...params, Status: 1 });
        console.log('API response:', JSON.stringify(res?.data, null, 2));
        const serResponse = res?.data?.data;
        const items = Array.isArray(serResponse) ? serResponse : (serResponse?.data || []);
        console.log('serResponse:', JSON.stringify(res?.data, null, 2));
        if (items.length > 0) {
          setServices(items);
        } else if (serResponse) {
          setServices([]);
        } else {
          setServices([]);
        }
      } else {
        // Parallel fetch for initial load without CategoryName logic
        if (categories.length === 0) {
          const [catRes, serRes] = await Promise.all([
            categoryApi.getCategories({ PageSize: 100 }),
            servicesApi.getServices({ ...params, CategoryId: currentFilters.CategoryId, Status: 1 })
          ]);

          const catResponse = catRes?.data?.data;
          const serResponse = serRes?.data?.data;

          const catItems = Array.isArray(catResponse) ? catResponse : (catResponse?.data || []);
          const serItems = Array.isArray(serResponse) ? serResponse : (serResponse?.data || []);

          setCategories(catItems);

          if (serItems.length > 0) {
            setServices(serItems);
          } else if (serResponse) {
            setServices([]);
          } else {
            setServices([]);
          }
        } else {
          // Normal fetch with existing categories
          let finalCategoryId = currentFilters.CategoryId;
          if (!finalCategoryId && currentFilters.CategoryName) {
            const matched = categories.find(c => c.name.toLowerCase() === currentFilters.CategoryName.toLowerCase());
            if (matched) finalCategoryId = matched.id;
          }

          if (finalCategoryId) params.CategoryId = finalCategoryId;

          const res = await servicesApi.getServices({ ...params, Status: 1 });
          const serResponse = res?.data?.data;
          const items = Array.isArray(serResponse) ? serResponse : (serResponse?.data || []);

          if (items.length > 0) {
            setServices(items);
          } else if (serResponse) {
            setServices([]);
          } else {
            setServices([]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    const currentFilters = {
      Search: searchParams.get('Search') || '',
      CategoryId: searchParams.get('CategoryId') || '',
      CategoryName: searchParams.get('CategoryName') || '',
      MinPrice: searchParams.get('MinPrice') || '',
      MaxPrice: searchParams.get('MaxPrice') || '',
      PageIndex: parseInt(searchParams.get('PageIndex') || '1'),
      PageSize: 12
    };
    setFilters(currentFilters);
    fetchServices(currentFilters);
  }, [searchParams, fetchServices]);

  const updateFilters = useCallback((newFilters) => {
    const updated = { ...filters, ...newFilters, PageIndex: 1 };
    setFilters(updated);

    const params = {};
    if (updated.PageIndex) params.PageIndex = updated.PageIndex;
    if (updated.MinPrice && Number(updated.MinPrice) > 0) params.MinPrice = updated.MinPrice;
    if (updated.MaxPrice && Number(updated.MaxPrice) > 0) params.MaxPrice = updated.MaxPrice;
    if (updated.CategoryId) params.CategoryId = updated.CategoryId;
    if (updated.CategoryName) params.CategoryName = updated.CategoryName;
    if (updated.Search) params.Search = updated.Search;

    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({
        MinPrice: filters.MinPrice,
        MaxPrice: filters.MaxPrice
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [filters.MinPrice, filters.MaxPrice, updateFilters]);

  const clearFilters = () => {
    setFilters({
      Search: '',
      CategoryId: '',
      CategoryName: '',
      MinPrice: '',
      MaxPrice: '',
      PageIndex: 1,
      PageSize: 12
    });
    setSearchParams({});
  };

  const handlePageChange = (newPageIndex) => {
    if (newPageIndex < 1) return;
    const updated = { ...filters, PageIndex: newPageIndex };
    setFilters(updated);

    const params = {};
    if (updated.PageIndex) params.PageIndex = updated.PageIndex;
    if (updated.PageSize) params.PageSize = updated.PageSize;
    if (updated.MinPrice && Number(updated.MinPrice) > 0) params.MinPrice = updated.MinPrice;
    if (updated.MaxPrice && Number(updated.MaxPrice) > 0) params.MaxPrice = updated.MaxPrice;
    if (updated.CategoryId) params.CategoryId = updated.CategoryId;
    if (updated.CategoryName) params.CategoryName = updated.CategoryName;
    if (updated.Search) params.Search = updated.Search;

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-primary-light dark:border-dark-border sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 font-bold text-lg dark:text-white">
                  <Filter size={20} className="text-primary" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-primary hover:underline flex items-center"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
                  <input
                    type="text"
                    value={filters.Search}
                    onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && updateFilters({ Search: filters.Search })}
                    placeholder="Keywords..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <Button
                  onClick={() => updateFilters({ Search: filters.Search })}
                  className="w-full mt-2 bg-primary hover:bg-primary-dark rounded-xl h-9 text-xs font-bold"
                >
                  Search
                </Button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Category</label>
                <select
                  value={filters.CategoryId || ""}
                  onChange={(e) => {
                    const selectedCat = categories.find(c => c.id === e.target.value);
                    updateFilters({
                      CategoryId: e.target.value,
                      CategoryName: selectedCat ? selectedCat.name : ''
                    });
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Price Range ($)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.MinPrice}
                    onChange={(e) => setFilters({ ...filters, MinPrice: e.target.value })}
                    className="w-1/2 h-10 px-3 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="text-primary/30">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.MaxPrice}
                    onChange={(e) => setFilters({ ...filters, MaxPrice: e.target.value })}
                    className="w-1/2 h-10 px-3 rounded-xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-primary-light dark:border-dark-border">
                <p className="text-xs text-primary/40 dark:text-primary-light/40 font-medium">
                  Showing {services.length} services matching your criteria.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-black text-[#1F1035] dark:text-white tracking-tight">
                {filters.Search ? `Results for "${filters.Search}"` : 'Browse All Services'}
              </h1>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-primary/60 dark:text-primary-light/60">Fetching the best talent for you...</p>
              </div>
            ) : error ? (
              <div className="bento-card p-12 text-center flex flex-col items-center justify-center bg-error/5 border-error/20">
                <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-6">
                  <Filter size={32} />
                </div>
                <h3 className="text-xl font-bold text-error mb-2">Something went wrong</h3>
                <p className="text-primary/60 dark:text-primary-light/60 mb-6">{error}</p>
                <Button onClick={() => fetchServices(filters)} className="bg-error hover:bg-error-dark text-white">Retry Connection</Button>
              </div>
            ) : services.length === 0 ? (
              <div className="bento-card p-12 text-center flex flex-col items-center justify-center py-24 min-h-[400px]">
                <div className="w-20 h-20 rounded-3xl bg-primary-light/20 flex items-center justify-center text-primary mb-8">
                  <Search size={40} />
                </div>
                <h3 className="text-2xl font-bold dark:text-white mb-2">No services found</h3>
                <p className="text-primary/60 dark:text-primary-light/60 mb-8 max-w-sm">
                  {filters.CategoryName
                    ? `We don't have any services in the "${filters.CategoryName}" category yet.`
                    : "We couldn't find any services matching your search criteria."}
                </p>
                <Button onClick={clearFilters} className="bg-primary hover:bg-primary-dark rounded-xl h-12 px-8 font-bold">
                  Browse All Services
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    disabled={filters.PageIndex === 1}
                    onClick={() => handlePageChange(filters.PageIndex - 1)}
                    className="h-12 w-12 p-0 rounded-xl border-primary-light dark:border-dark-border"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <div className="flex items-center font-bold dark:text-white">
                    <span className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20">{filters.PageIndex}</span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={services.length < filters.PageSize}
                    onClick={() => handlePageChange(filters.PageIndex + 1)}
                    className="h-12 w-12 p-0 rounded-xl border-primary-light dark:border-dark-border"
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
