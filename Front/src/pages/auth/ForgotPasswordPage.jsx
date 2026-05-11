import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/authApi';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please check your email and try again.');
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
          <h1 className="text-2xl font-bold text-primary dark:text-white">Forgot Password?</h1>
          <p className="text-primary/60 dark:text-primary-light/60">No worries, we'll send you reset instructions.</p>
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
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.email ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-error font-medium">{errors.email.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary-dark transition-all"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-light dark:border-dark-border text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-bold text-primary/60 dark:text-primary-light/60 hover:text-primary transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
