import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Home, Tv, Film, Compass, User, MonitorPlay, Sparkles } from 'lucide-react';
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
    { name: 'TV Shows', path: '/tvshows', icon: Tv },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Live TV', path: '/livetv', icon: MonitorPlay },
    { name: 'Anime', path: '/anime', icon: Sparkles },
  ];

  return (
    <>
      {/* Cinevarse / Hotstar Styled Sidebar */}
      <motion.div 
        className="fixed left-0 top-0 bottom-0 z-[100] hidden md:flex flex-col items-start transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ 
          width: isHovered ? '280px' : '90px',
          background: isHovered 
            ? 'linear-gradient(to right, #0f1014 0%, #0f1014 90%, rgba(15, 16, 20, 0) 100%)' 
            : 'linear-gradient(to right, #0f1014 0%, rgba(15, 16, 20, 0) 100%)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-start w-full py-10 h-full">
          
          {/* Brand Logo */}
          <div className="px-7 mb-12 flex flex-col items-start overflow-hidden">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                  C
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex flex-col"
                    >
                      <span className="text-white font-black text-xl tracking-tighter italic uppercase">Cinevarse</span>
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[2px]">Premium</span>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col w-full gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = router.pathname === link.path;
              
              return (
                <Link key={link.name} href={link.path}>
                  <div className={`relative group flex items-center w-full py-4 px-8 cursor-pointer transition-all duration-300 ${isActive ? 'text-white' : 'text-[#8f98b0] hover:text-white'}`}>
                    
                    <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`ml-8 text-[17px] font-medium whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

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

      {/* Dim Overlay */}
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

      {/* Mobile Top Header */}
      <header className={`md:hidden fixed top-0 left-0 right-0 h-16 z-[95] px-6 flex items-center justify-between transition-all ${scrolled ? 'bg-[#0f1014]' : 'bg-transparent'}`}>
         <span className="text-white font-black italic uppercase tracking-tighter text-xl">Cinevarse</span>
         <div className="flex items-center gap-4">
            <Search size={22} className="text-white/70" />
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">G</div>
         </div>
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-16 bg-[#16181f]/95 backdrop-blur-2xl border border-white/5 rounded-2xl z-[100] flex items-center justify-around px-2 shadow-2xl shadow-black/50">
         {navLinks.slice(1, 6).map((link) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;
            return (
              <Link key={link.name} href={link.path} className={`flex flex-col items-center justify-center gap-1 w-12 h-12 transition-all ${isActive ? 'text-blue-500' : 'text-[#8f98b0]'}`}>
                <Icon size={22} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">{link.name}</span>
              </Link>
            )
         })}
      </nav>
    </>
  );
}
