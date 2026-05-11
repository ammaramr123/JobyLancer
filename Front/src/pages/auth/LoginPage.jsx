import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { clientApi } from '../../api/clientApi';
import { providerApi } from '../../api/providerApi';
import { useAuthStore } from '../../store/authStore';
import { buildImageUrl } from '../../lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      // Extra nested data because of response structure { data: { data: { token, roles, ... } } }
      const loginData = response.data.data;
      const { token, roles, name, email, id } = loginData;
      
      const user = {
        id: id,
        fullName: name,
        email: email,
        role: roles[0]
      };
      
      setAuth(user, token);

      // Fetch full profile after login to get profile image and other details
      try {
        if (user.role === 'Client') {
          const profileRes = await clientApi.getMyProfile();
          const profileData = profileRes?.data?.data;
          if (profileData) {
            useAuthStore.getState().updateUser({ 
              profileImageUrl: buildImageUrl(profileData.profileImageUrl),
              fullName: profileData.name || profileData.fullName 
            });
          }
        } else if (user.role === 'Provider') {
          const profileRes = await providerApi.getMyProfile();
          const profileData = profileRes?.data?.data;
          if (profileData) {
            useAuthStore.getState().updateUser({ 
              profileImageUrl: buildImageUrl(profileData.profileImageUrl),
              fullName: profileData.name || profileData.fullName 
            });
          }
        }
      } catch (err) {
        console.error('Profile fetch error after login:', err);
      }

      // Redirect based on role string: "Admin", "Provider", "Client"
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Provider') {
        navigate('/provider/profile');
      } else if (user.role === 'Client') {
        navigate('/client/profile');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
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
          <h1 className="text-2xl font-bold text-primary dark:text-white">Welcome back</h1>
          <p className="text-primary/60 dark:text-primary-light/60">Please enter your details to sign in</p>
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
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className={`w-full h-12 px-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                  errors.email ? 'border-error' : 'border-primary-light dark:border-dark-border'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-error font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-primary/80 dark:text-primary-light/80">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 rounded-xl border bg-primary-light/10 dark:bg-dark-bg dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.password ? 'border-error' : 'border-primary-light dark:border-dark-border'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary-dark transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-error font-medium">{errors.password.message}</p>
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
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-primary-light dark:border-dark-border text-center">
            <p className="text-sm text-primary/60 dark:text-primary-light/60">
              Don't have an account? {' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
