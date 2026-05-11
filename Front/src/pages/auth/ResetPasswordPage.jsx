import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/authApi';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Fail to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-light/30 dark:bg-dark-bg p-4 transition-colors">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4 dark:text-white">Password Reset!</h1>
          <p className="text-primary/60 dark:text-primary-light/60 mb-8">Your password has been successfully reset. Redirecting you to login...</p>
          <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary-dark rounded-xl px-10 h-14 text-lg">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-primary dark:text-white">Set new password</h1>
          <p className="text-primary/60 dark:text-primary-light/60">Please enter your new security credentials</p>
        </div>

        <div className="bg-white dark:bg-dark-card border border-primary-light dark:border-dark-border rounded-2xl shadow-xl shadow-primary/5 p-8 transition-colors">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start space-x-3 text-error text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-primary/80 dark:text-primary-light/80 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-12 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.newPassword ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-error font-medium">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-primary/80 dark:text-primary-light/80 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-12 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.confirmPassword ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-error font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary-dark transition-all mt-4"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
