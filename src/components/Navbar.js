import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Home, Tv, Film, Compass, User, Trophy, Sparkles, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'My Space', path: '/login', icon: User },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Home', path: '/', icon: Home },
    { name: 'TV', path: '/tvshows', icon: Tv },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Sports', path: '/sports', icon: Trophy, badge: 'Live' },
    { name: 'Categories', path: '/categories', icon: LayoutGrid },
  ];

  return (
    <>
      {/* Hotstar Sidebar Implementation */}
      <motion.div 
        className="fixed left-0 top-0 bottom-0 z-[100] flex transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ 
          width: isHovered ? '240px' : '96px',
          background: isHovered 
            ? 'linear-gradient(to right, #0f1014 0%, #0f1014 80%, rgba(15, 16, 20, 0.4) 100%)' 
            : 'linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-start w-full py-10">
          
          {/* Logo Section */}
          <div className="px-7 mb-10 flex flex-col items-center">
             <div className="w-12 h-12 flex items-center justify-center relative">
                <img 
                  src="https://img1.hotstarext.com/it/u/1/1666613306666.png" 
                  alt="Hotstar Logo" 
                  className="w-full object-contain"
                />
             </div>
             {isHovered && (
                <button className="mt-4 bg-[#ffcc00] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  Subscribe &gt;
                </button>
             )}
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col w-full">
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = router.pathname === link.path;
              
              return (
                <Link key={link.name} href={link.path}>
                  <div className={`relative group flex items-center w-full py-5 px-8 cursor-pointer transition-all duration-200 ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                    
                    {/* Hover Scale and Drop Shadow for active/hover states */}
                    <div className={`transition-all duration-200 ${isActive || isHovered ? 'scale-110' : 'scale-100'} ${isActive ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`}>
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    {/* Badge for Sports/Live */}
                    {link.badge && !isHovered && (
                      <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-red-600 rounded-full" />
                    )}

                    <AnimatePresence>
                      {isHovered && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`ml-6 text-[18px] font-medium whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Item indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeBar"
                        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Background Dimming Overlay when Hovered */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 z-[90] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Mobile Top Header (Hotstar Style) */}
      <header className={`md:hidden fixed top-0 left-0 right-0 h-16 z-[95] px-4 flex items-center justify-between transition-all ${scrolled ? 'bg-[#0f1014]' : 'bg-transparent'}`}>
         <div className="flex items-center gap-4">
            <img src="https://img1.hotstarext.com/it/u/1/1666613306666.png" className="h-8" alt="Hotstar" />
            <button className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded">Subscribe</button>
         </div>
         <Search size={20} className="text-white opacity-70" />
      </header>

      {/* Mobile Bottom Nav (Thumb-Friendly Hotstar Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f1014] z-[100] border-t border-white/5 flex items-center justify-around px-2">
         {navLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;
            return (
              <Link key={link.name} href={link.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-white/40'}`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            )
         })}
      </nav>
    </>
  );
}
