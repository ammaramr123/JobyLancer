import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { servicesApi } from '@/api/servicesApi';
import { reviewApi } from '@/api/reviewApi';
import { requestApi } from '@/api/requestApi';
import { useAuth } from '@/hooks/useAuth';
import { buildImageUrl } from '@/lib/utils';
import {
  Loader2, Star, Clock, User, CheckCircle2,
  ChevronRight, AlertCircle, MessageSquare, Info, X,
  Shield, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const { user, isClient, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const images = service?.images || [];

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [serviceRes, reviewsRes] = await Promise.all([
          servicesApi.getServiceById(id),
          reviewApi.getServiceReviews(id).catch(() => ({ data: { data: [] } }))
        ]);

        const apiService = serviceRes?.data?.data;
        if (apiService) {
          setService(apiService);
          setReviews(reviewsRes?.data?.data || []);
        } else {
          throw new Error('Service data is null in API response');
        }
      } catch (err) {
        console.error('API fetch failed for service detail:', err);
        setError(err.response?.data?.errors?.[0] || 'Service could not be loaded. Please try again.');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!bookingMessage.trim()) {
      setBookingError('Please enter a message for the provider.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      const payload = {
        serviceId: id,
        message: bookingMessage,
        agreedPrice: agreedPrice ? parseFloat(agreedPrice) : service.price
      };

      await requestApi.createRequest(payload);
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        navigate('/client/requests');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.response?.data?.errors?.[0] || 'Failed to place request. Please try again.');
    } finally {
      setBookingLoading(false);
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

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mb-8">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold dark:text-white mb-4">Error Loading Service</h1>
          <p className="text-primary/60 dark:text-primary-light/60 mb-8 max-w-md">{error || 'Service not found'}</p>
          <Button onClick={() => navigate('/services')} className="bg-primary hover:bg-primary-dark">
            Back to Services
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Status Banner */}
        {service.status === 'Pending' && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center text-amber-600 font-bold">
            <Clock className="mr-3 shrink-0" size={20} />
            <p>This service is pending approval. Only you (the provider) and administrators can see it now.</p>
          </div>
        )}
        {service.status === 'Rejected' && (
          <div className="mb-8 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center text-error font-bold">
            <AlertCircle className="mr-3 shrink-0" size={20} />
            <div>
              <p>This service has been rejected and is not visible to the public.</p>
              {service.rejectionReason && <p className="text-sm mt-1 opacity-80">Reason: {service.rejectionReason}</p>}
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm font-bold text-primary/40 dark:text-primary-light/40 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <ChevronRight size={14} />
          <span className="text-primary dark:text-white truncate max-w-xs">{service.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            <h1 className="text-4xl md:text-5xl font-black text-[#1F1035] dark:text-white tracking-tight mb-6 leading-[1.1]">
              {service.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-primary-light dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                  {service.providerName?.charAt(0) || <User size={20} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-primary/40 dark:text-primary-light/40 uppercase tracking-widest leading-none mb-1">Expert Provider</p>
                  <p className="font-extrabold dark:text-white">{service.providerName || 'Professional'}</p>
                </div>
              </div>

              <div className="h-10 w-px bg-primary-light dark:bg-dark-border hidden md:block"></div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center text-yellow-500">
                  <Star size={18} fill="currentColor" />
                  <span className="ml-1.5 font-bold text-lg dark:text-white">{service.rating || 'N/A'}</span>
                </div>
                <span className="text-primary/40 dark:text-primary-light/40 font-medium">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-12">
              <div className="aspect-video rounded-[32px] overflow-hidden bento-card relative flex items-center justify-center bg-primary/5">
                {service?.images?.[0]?.imageUrl ? (
                  <img
                    src={buildImageUrl(service.images[0].imageUrl)}
                    alt={service?.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400";
                    }}
                  />
                ) : (
                  <Briefcase size={80} className="text-primary/20" />
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {images.slice(1, 5).map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className="aspect-square rounded-2xl overflow-hidden bento-card bg-primary/5"
                    >
                      <img
                        src={buildImageUrl(img.imageUrl)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-primary dark:prose-invert max-w-none mb-16">
              <h3 className="text-2xl font-bold dark:text-white mb-6 flex items-center">
                <Info size={24} className="mr-3 text-primary" />
                Service Description
              </h3>
              <p className="text-lg text-[#6B7280] dark:text-primary-light/80 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            {/* Reviews */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold dark:text-white mb-8 flex items-center">
                <MessageSquare size={24} className="mr-3 text-primary" />
                Provider Reviews
              </h3>

              {reviews.length === 0 ? (
                <div className="bento-card p-10 text-center bg-primary-light/5 border-dashed">
                  <p className="text-primary/60 dark:text-primary-light/60 italic font-medium">No reviews yet for this service. Be the first one to review!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bento-card p-6 bg-white dark:bg-dark-card border-primary-light dark:border-dark-border">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary-light/30 flex items-center justify-center text-primary font-bold">
                            {review.clientName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold dark:text-white">{review.clientName || 'Verified Client'}</p>
                            <div className="flex items-center text-yellow-500 scale-75 origin-left">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary/30 dark:text-primary-light/30 uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-primary/70 dark:text-primary-light/70 italic text-sm">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Pricing Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div className="bento-card bg-white dark:bg-dark-card p-8 shadow-2xl shadow-primary/10 border-primary-light dark:border-dark-border">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs font-bold text-primary/40 dark:text-primary-light/40 uppercase tracking-tighter mb-1">Standard Package</p>
                  <h2 className="text-4xl font-black text-[#1F1035] dark:text-white tracking-tighter">${service.price}</h2>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-black uppercase">Fixed Price</div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex items-center space-x-3 text-primary/70 dark:text-primary-light/70 font-semibold">
                  <Clock size={20} className="text-primary" />
                  <span>{service.deliveryDays || 3} Days Express Delivery</span>
                </div>
                <div className="flex items-center space-x-3 text-primary/70 dark:text-primary-light/70 font-semibold">
                  <Shield size={20} className="text-primary" />
                  <span>JobyLancer Payment Protection</span>
                </div>
                <div className="flex items-center space-x-3 text-primary/70 dark:text-primary-light/70 font-semibold">
                  <Briefcase size={20} className="text-primary" />
                  <span>{service.categoryName || 'Unlimited Revisions'}</span>
                </div>
              </div>

              {isAuthenticated ? (
                isClient ? (
                  <Button
                    onClick={() => setShowBookingModal(true)}
                    disabled={service.status !== 'Approved'}
                    className="w-full h-16 text-lg font-bold rounded-2xl bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:bg-primary/40 disabled:scale-100 disabled:shadow-none"
                  >
                    {service.status === 'Approved' ? 'Book This Service' : 'Service Not Available'}
                  </Button>
                ) : (
                  <div className="p-4 bg-primary-light/20 rounded-xl flex items-start space-x-3 text-primary text-sm font-medium border border-primary/10">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>Only Clients can book services. Please switch to a Client account to proceed.</p>
                  </div>
                )
              ) : (
                <Link to="/login" className="block">
                  <Button className="w-full h-16 text-lg font-bold rounded-2xl bg-white dark:bg-dark-card border-2 border-primary text-primary hover:bg-primary-light transition-all">
                    Sign In to Book
                  </Button>
                </Link>
              )}

              <p className="mt-8 text-center text-xs font-bold text-primary/30 dark:text-primary-light/30 uppercase tracking-[0.2em]">Quality Guaranteed</p>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !bookingLoading && setShowBookingModal(false)}
              className="absolute inset-0 bg-[#1F1035]/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-[32px] shadow-2xl p-8 overflow-hidden border border-primary-light dark:border-dark-border"
            >
              {bookingSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={44} />
                  </div>
                  <h2 className="text-3xl font-bold dark:text-white mb-2 text-[#1F1035]">Request Sent!</h2>
                  <p className="text-primary/60 dark:text-primary-light/60">Your booking request has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-[#1F1035] dark:text-white tracking-tight">Place Request</h2>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="p-2 hover:bg-primary-light dark:hover:bg-dark-border rounded-xl transition-colors"
                    >
                      <X size={24} className="text-primary/40" />
                    </button>
                  </div>

                  {bookingError && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start space-x-3 text-error text-sm font-medium">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p>{bookingError}</p>
                    </div>
                  )}

                  <form onSubmit={handleBooking} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Proposal Message</label>
                      <textarea
                        value={bookingMessage}
                        onChange={(e) => setBookingMessage(e.target.value)}
                        placeholder="Tell the provider about your project requirements..."
                        className="w-full h-40 p-5 rounded-2xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-primary/60 dark:text-primary-light/60 mb-2 uppercase tracking-wider">Agreed Price ($)</label>
                      <input
                        type="number"
                        value={agreedPrice}
                        onChange={(e) => setAgreedPrice(e.target.value)}
                        placeholder={`Suggested: $${service.price}`}
                        className="w-full h-14 px-5 rounded-2xl border border-primary-light dark:border-dark-border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <p className="mt-2 text-xs text-primary/40 dark:text-primary-light/40 font-medium italic">Leave empty to use the standard price of ${service.price}.</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full h-16 text-lg font-bold rounded-2xl bg-primary hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                    >
                      {bookingLoading ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Booking'}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ServiceDetailsPage;