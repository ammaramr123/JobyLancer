import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, User, Zap, ArrowRight } from 'lucide-react';
// في ServiceCard.jsx
import { buildImageUrl } from '@/lib/utils'; // أضف الاستيراد ده
const ServiceCard = ({ service, showStatus = false }) => {
  const getStatusBadge = (status) => {
    const s = parseInt(status);
    switch (s) {
      case 0:
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20">Pending Approval</span>;
      case 1:
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Active</span>;
      case 2:
        return <span className="px-2 py-0.5 bg-error/10 text-error rounded-lg text-[8px] font-black uppercase tracking-widest border border-error/20">Rejected</span>;
      default:
        return null;
    }
  };
  console.log('imageUrl value:', service.images?.[0]?.imageUrl);
  console.log('type:', typeof service.images?.[0]?.imageUrl);
  console.log('full service:', JSON.stringify(service, null, 2));
  return (

    <Link
      to={`/services/${service.id}`}
      className="bento-card group flex flex-col h-full border-primary-light dark:border-dark-border relative"
    >

      <div className="aspect-[16/10] bg-primary-light/50 dark:bg-dark-bg relative overflow-hidden">
        <img
          src={
            service.images?.[0]?.imageUrl
              ? buildImageUrl(service.images[0].imageUrl)
              : service.thumbnailUrl
                ? buildImageUrl(service.thumbnailUrl)
                : 'https://images.unsplash.com/photo-1454165833767-1330084bc6f9?auto=format&fit=crop&q=80&w=400'
          }
          alt={service.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {showStatus && getStatusBadge(service.status)}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-bg/90 p-2 rounded-xl shadow-lg backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-1 px-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold dark:text-white">{service.averageRating || service.rating || 'New'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow text-left">
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-primary font-extrabold mb-3">
          <Zap size={10} />
          <span>{service.categoryName || 'Professional Service'}</span>
        </div>

        <h3 className="font-bold text-xl dark:text-white line-clamp-2 mb-4 leading-tight group-hover:text-primary transition-colors">{service.title}</h3>

        <div className="flex items-center space-x-4 mb-6 text-primary/40 dark:text-primary-light/40">
          <div className="flex items-center text-xs font-semibold">
            <Clock size={12} className="mr-1.5 text-primary/60" />
            <span>{service.deliveryDays || 3}d delivery</span>
          </div>
          <div className="flex items-center text-xs font-semibold">
            <User size={12} className="mr-1.5 text-primary/60" />
            <span>{service.providerName || 'Top Rated'}</span>
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-primary-light dark:border-dark-border flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-primary/40 dark:text-primary-light/40 tracking-wider">Starting from</p>
            <p className="text-2xl font-black text-primary dark:text-white">${service.price}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-light/20 dark:bg-dark-card border border-primary-light dark:border-dark-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
