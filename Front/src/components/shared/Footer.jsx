import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-light/30 dark:bg-dark-bg/50 border-t border-primary-light dark:border-dark-border py-16 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                JL
              </div>
              <div className="flex items-baseline font-extrabold tracking-tight text-xl">
                <span className="text-primary dark:text-white transition-colors">Joby</span>
                <span className="text-accent transition-colors">Lancer</span>
              </div>
            </div>
            <p className="text-[#6B7280] dark:text-primary-light/70 max-w-sm leading-relaxed">
              Connecting top-tier practitioners with forward-thinking businesses. 
              Built for speed, scale, and uncompromising quality in the modern digital economy.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-[#1F1035] dark:text-white uppercase tracking-wider text-xs">Platform</h3>
            <ul className="space-y-4 text-[#6B7280] dark:text-primary-light/70 text-sm font-medium">
              <li><a href="/services" className="hover:text-primary dark:hover:text-white transition-colors">Find Services</a></li>
              <li><a href="/register" className="hover:text-primary dark:hover:text-white transition-colors">Become a Provider</a></li>
              <li><a href="/login" className="hover:text-primary dark:hover:text-white transition-colors">Client Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-[#1F1035] dark:text-white uppercase tracking-wider text-xs">Support</h3>
            <ul className="space-y-4 text-[#6B7280] dark:text-primary-light/70 text-sm font-medium">
              <li><a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary dark:hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-light/50 dark:border-dark-border/50 mt-16 pt-8 text-center text-primary/40 dark:text-primary-light/40 text-sm font-medium">
          © {new Date().getFullYear()} JobyLancer. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
