import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Home, Tv, Film, Compass, User, MonitorPlay, Sparkles, Zap, Star, Play, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'My Space', path: '/login', icon: User },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Home', path: '/', icon: Home },
    { name: 'TV', path: '/tvshows', icon: Tv },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Live TV', path: '/livetv', icon: MonitorPlay },
    { name: 'Anime', path: '/anime', icon: Sparkles },
    { name: 'Trending', path: '/trending', icon: Compass },
    { name: 'Anime World', path: '/site/anime-world', icon: Zap },
    { name: 'Anime Salt', path: '/site/anime-salt', icon: Star },
  ];

  return (
    <>
      <motion.div 
        initial={false}
        animate={{ 
          width: isHovered ? 260 : 96,
          backgroundColor: isHovered ? 'rgba(15, 16, 20, 0.95)' : 'rgba(15, 16, 20, 0.4)'
        }}
        className="fixed top-0 left-0 h-screen z-50 flex flex-col items-start backdrop-blur-xl border-r border-white/5 transition-all hidden md:flex"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo Section */}
        <div className="w-full px-7 pt-10 pb-12 flex items-center gap-4 overflow-hidden">
          <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Play fill="white" size={20} className="text-white ml-0.5" />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-black text-white tracking-tighter"
              >
                CINEVERSE
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col h-full w-full justify-start overflow-y-auto no-scrollbar pl-6 py-2 gap-2">
          {navLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;

            return (
              <Link
                href={link.path}
                key={link.name}
                className={`flex items-center gap-5 group cursor-pointer w-full py-3.5 px-3 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-blue-600/10 text-white' : 'text-[#8f98b0] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ${
                      isActive ? 'text-blue-500' : 'group-hover:scale-110'
                    }`}
                  />
                  {isActive && !isHovered && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute -left-6 w-1 h-6 bg-blue-500 rounded-r-full"
                    />
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`text-[15px] font-bold whitespace-nowrap ${isActive ? 'text-white' : ''}`}
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-[#16181f]/80 backdrop-blur-2xl border border-white/10 flex items-center justify-around py-3 px-4 rounded-3xl shadow-2xl shadow-black">
         {navLinks.slice(2, 7).map((link) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;
            return (
              <Link href={link.path} key={link.name} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-500' : 'text-[#8f98b0]'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold`}>{link.name}</span>
              </Link>
            )
         })}
      </nav>
    </>
  );
}


