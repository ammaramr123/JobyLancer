import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { requestApi } from '@/api/requestApi';
import { 
  Loader2, Package, Calendar, DollarSign, 
  User, MessageSquare, Star, ArrowLeft,
  CheckCircle2, Clock, XCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

const STATUS_MAP = {
  0: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
  1: { label: 'Accepted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  2: { label: 'Rejected', color: 'text-error bg-error/5 border-error/20', icon: XCircle },
  3: { label: 'Completed', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 }
};

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const res = await requestApi.getRequestById(id);
        const data = res?.data?.data;
        if (data) {
          setRequest(data);
        } else {
          setError('Request not found.');
        }
      } catch (err) {
        console.error('API error fetching request details:', err);
        setError('Failed to load request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

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

  if (!request) return null;

  const StatusIcon = STATUS_MAP[request.status]?.icon || Clock;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary/60 hover:text-primary transition-colors mb-8 font-bold text-sm"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Requests
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-card p-8"
              >
                <div className="flex items-start justify-between mb-8">
                   <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                      <Package size={32} />
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${STATUS_MAP[request.status]?.color}`}>
                      <StatusIcon size={14} />
                      {STATUS_MAP[request.status]?.label}
                   </div>
                </div>

                <h1 className="text-3xl font-black text-[#1F1035] dark:text-white mb-2">{request.serviceTitle}</h1>
                <p className="text-primary font-bold mb-8">{request.categoryName}</p>

                <div className="p-6 bg-primary-light/30 dark:bg-dark-bg rounded-2xl border border-primary-light dark:border-dark-border">
                  <h3 className="text-xs font-black text-primary/40 uppercase tracking-widest mb-3">Your Message</h3>
                  <p className="text-[#6B7280] dark:text-primary-light/80 leading-relaxed">
                    {request.message}
                  </p>
                </div>
              </motion.div>

              {/* Timeline/History can be added here */}
            </div>

            {/* Right Column - Summary & Stats */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bento-card p-6 border-2 border-primary/10 shadow-xl shadow-primary/5"
              >
                <h3 className="text-lg font-bold mb-6 dark:text-white">Request Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-primary-light dark:border-dark-border">
                    <div className="flex items-center text-primary/40 text-sm font-bold uppercase tracking-widest">
                      <DollarSign size={16} className="mr-2" />
                      Amount
                    </div>
                    <span className="text-xl font-black dark:text-white">${request.agreedPrice || request.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-primary-light dark:border-dark-border">
                    <div className="flex items-center text-primary/40 text-sm font-bold uppercase tracking-widest">
                      <Calendar size={16} className="mr-2" />
                      Created
                    </div>
                    <span className="font-bold dark:text-white text-sm">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-4">
                    <p className="text-xs font-black text-primary/40 uppercase tracking-widest mb-3">Provider</p>
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-primary/5 dark:bg-dark-bg border border-primary-light dark:border-dark-border">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                          {request.providerName?.charAt(0)}
                       </div>
                       <div className="flex-grow">
                          <p className="text-sm font-bold dark:text-white">{request.providerName}</p>
                          <p className="text-[10px] text-primary/60 font-medium">Top Provider</p>
                       </div>
                       <Link to={`/chat/${request.id}`}>
                          <MessageSquare size={16} className="text-primary hover:scale-120 transition-transform cursor-pointer" />
                       </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {request.status === 1 && (
                    <Link to={`/chat/${request.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary-dark rounded-xl h-12 font-bold shadow-lg shadow-primary/20">
                        Open Chat
                      </Button>
                    </Link>
                  )}
                  {request.status === 3 && (
                    <Link to="/client/review" state={{ requestId: request.id }}>
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl h-12 font-bold shadow-lg shadow-emerald-200">
                        Leave Review
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full text-primary/60 hover:text-primary font-bold rounded-xl h-12">
                    Need Help?
                  </Button>
                </div>
              </motion.div>

              {/* Progress Indicator */}
              <div className="bento-card p-6 bg-primary/5">
                 <h4 className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-4">Milestone Progress</h4>
                 <div className="space-y-4">
                    {[
                      { label: 'Request Placed', done: true },
                      { label: 'Provider Accept', done: request.status >= 1 },
                      { label: 'Work in Progress', done: request.status >= 1 },
                      { label: 'Order Completed', done: request.status === 3 }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${step.done ? 'bg-primary animate-pulse' : 'bg-primary/20'}`}></div>
                        <span className={`text-xs font-bold ${step.done ? 'text-primary' : 'text-primary/30'}`}>{step.label}</span>
                      </div>
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

export default RequestDetailsPage;
