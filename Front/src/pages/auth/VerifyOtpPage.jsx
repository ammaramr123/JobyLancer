import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/authApi';

const verifyOtpSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
});

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // If no email in state, redirect back to forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyOtp({ email, otp: data.otp });
      // On success, go to reset-password with email and otp in state
      navigate('/reset-password', { state: { email, otp: data.otp } });
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light/30 dark:bg-dark-bg p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
               JL
            </div>
            <div className="flex items-baseline font-extrabold tracking-tight text-3xl">
              <span className="text-primary dark:text-white transition-colors">Joby</span>
              <span className="text-accent transition-colors">Lancer</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-primary dark:text-white">Check your email</h1>
          <p className="text-primary/60 dark:text-primary-light/60">We've sent a code to <span className="text-primary dark:text-white font-bold">{email}</span></p>
        </div>

        <div className="bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border rounded-2xl shadow-xl shadow-primary/5 p-8 transition-colors">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start space-x-3 text-error text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary/80 dark:text-primary-light/80 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <input
                  {...register('otp')}
                  type="text"
                  placeholder="Enter 6-digit code"
                  className={`w-full h-12 pl-12 pr-4 text-center tracking-widest text-lg font-bold rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.otp ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
              </div>
              {errors.otp && (
                <p className="mt-1 text-xs text-error font-medium text-center">{errors.otp.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary-dark transition-all"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-light dark:border-dark-border text-center">
            <Link to="/forgot-password" className="inline-flex items-center text-sm font-bold text-primary/60 dark:text-primary-light/60 hover:text-primary transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Change email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
