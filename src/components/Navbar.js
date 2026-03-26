import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Home, Tv, Film, Compass, User, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'TV Shows', path: '/tvshows', icon: Tv },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Trending', path: '/trending', icon: Compass },
    { name: 'Account', path: '/login', icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar (Minimal) */}
      <motion.div 
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-[100] bg-[#0a0b0f] border-r border-white/5 flex-col items-center py-10 transition-all duration-300"
        style={{ width: isHovered ? '240px' : '80px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="mb-14">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            C
          </div>
        </div>

        <div className="flex flex-col gap-8 w-full px-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;
            
            return (
              <Link key={link.path} href={link.path}>
                <div className={`group flex items-center gap-4 cursor-pointer transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                  <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-blue-600' : 'group-hover:bg-white/5'}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile Top Header (Mini) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0b0f]/80 backdrop-blur-xl z-[90] flex items-center justify-between px-6 border-b border-white/5">
         <span className="text-white font-black italic uppercase tracking-tighter text-xl">Cineverse</span>
         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <User size={18} className="text-white" />
         </div>
      </div>

      {/* Mobile Bottom App Navigation (Premium Bar) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-16 z-[100] bg-[#16181f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-around px-2">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = router.pathname === link.path;
          
          return (
            <Link key={link.path} href={link.path} className="relative flex flex-col items-center justify-center w-12 h-12">
              <motion.div
                animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                className={`transition-colors duration-300 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              
              {isActive && (
                <motion.div 
                  layoutId="mobileActive"
                  className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
        
        {/* Mobile Menu Icon for more */}
        <button className="flex flex-col items-center justify-center w-12 h-12 text-gray-500">
           <Menu size={22} />
        </button>
      </nav>
    </>
  );
}
