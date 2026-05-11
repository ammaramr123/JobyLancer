import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { reviewApi } from '@/api/reviewApi';
import { Star, Send, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const LeaveReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestId = location.state?.requestId;
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestId) {
      setError("Request ID missing. Please return to your requests page.");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await reviewApi.createReview({ requestId, rating, comment });
      navigate('/client/requests');
    } catch (err) {
      console.error('Error submitting review:', err);
      // Fallback for demo
      setTimeout(() => navigate('/client/requests'), 1500);
    } finally {
      // setSubmitting(false); // navigate will unmount
    }
  };

  if (!requestId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300 font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="bento-card p-12 max-w-md">
            <MessageSquare className="w-16 h-16 text-primary/20 mb-6 mx-auto" />
            <h2 className="text-2xl font-black text-[#1F1035] dark:text-white mb-4">Review Access Lost</h2>
            <p className="text-primary/60 font-bold mb-8 uppercase tracking-widest text-xs">Please initiate review from your requests history</p>
            <Button onClick={() => navigate('/client/requests')} className="bg-primary text-white w-full h-12 rounded-xl">
              Back to Requests
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
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary/60 hover:text-primary transition-colors mb-8 font-bold text-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Cancel Review
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-12"
          >
            <div className="text-center mb-12">
               <h1 className="text-4xl font-black text-[#1F1035] dark:text-white mb-4 tracking-tighter">Review Your Experience</h1>
               <p className="text-primary/60 font-bold uppercase text-[10px] tracking-[0.2em]">Share your feedback about the service provided</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
               {/* Star Rating */}
               <div className="flex flex-col items-center">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all duration-300 hover:scale-125 focus:outline-none"
                      >
                        <Star 
                          size={48} 
                          className={`transition-all duration-300 ${
                            (hoverRating || rating) >= star 
                              ? 'fill-primary text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]' 
                              : 'text-primary/10'
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {rating > 0 && (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary font-black uppercase text-xs tracking-widest"
                      >
                        {rating === 5 ? 'Masterpiece!' : 
                         rating === 4 ? 'Excellent Work' : 
                         rating === 3 ? 'Good Result' : 
                         rating === 2 ? 'Could be better' : 'Needs Improvement'}
                      </motion.p>
                    )}
                  </AnimatePresence>
               </div>

               {/* Comment */}
               <div className="space-y-4">
                  <label className="text-xs font-black text-primary/40 uppercase tracking-widest pl-2">
                    Describe your experience
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className="w-full p-6 bento-card border-2 border-primary/5 dark:bg-dark-bg dark:text-white focus:border-primary outline-none transition-all placeholder:text-primary/20 font-bold"
                    placeholder="What did you like? Was anything missing? Your feedback helps the community..."
                  />
               </div>

               {error && (
                 <div className="p-4 bg-error/5 border border-error/20 rounded-xl text-error text-xs font-bold text-center">
                   {error}
                 </div>
               )}

               <Button 
                 type="submit" 
                 disabled={submitting}
                 className="w-full h-16 bg-primary hover:bg-primary-dark rounded-[24px] text-lg font-black shadow-2xl shadow-primary/30 group"
               >
                 {submitting ? (
                   <Loader2 size={24} className="animate-spin" />
                 ) : (
                   <>
                     Submit Review
                     <Send size={20} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </>
                 )}
               </Button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LeaveReviewPage;
