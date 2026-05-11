import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, User, Mail, Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/authApi';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  userType: z.coerce.number().min(1, 'Please select if you are a Client or Provider'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'Password must contain uppercase, lowercase, number and special character (@$!%*?&)'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 1
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(data);
      // Success - redirect to login
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-light/30 dark:bg-dark-bg p-4 transition-colors">
      <div className="w-full max-w-md my-8">
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
          <h1 className="text-2xl font-bold text-primary dark:text-white">Create an account</h1>
          <p className="text-primary/60 dark:text-primary-light/60">Join the world's most talented network</p>
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
                User Type
              </label>
              <select
                {...register('userType')}
                className={`w-full h-12 px-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer ${
                  errors.userType ? 'border-error' : 'border-primary-light dark:border-dark-border'
                }`}
              >
                <option value={1}>I am a client (Looking for services)</option>
                <option value={2}>I am a freelancer (Offering services)</option>
              </select>
              {errors.userType && (
                <p className="mt-1 text-xs text-error font-medium">{errors.userType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-primary/80 dark:text-primary-light/80 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="John Doe"
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.fullName ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-error font-medium">{errors.fullName.message}</p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-bold text-primary/80 dark:text-primary-light/80 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="+1 234 567 890"
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.phoneNumber ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-error font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-primary/80 dark:text-primary-light/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.password ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-error font-medium">{errors.password.message}</p>
              )}
              {!errors.password && (
                <p className="mt-2 text-[10px] text-primary/40 dark:text-primary-light/40 leading-tight">
                  Must be at least 8 characters with uppercase, lowercase, number and special character (@$!%*?&).
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary-dark transition-all mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-light dark:border-dark-border text-center">
            <p className="text-sm text-primary/60 dark:text-primary-light/60">
              Already have an account? {' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
