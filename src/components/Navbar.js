import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Home, Tv, Film, Compass, User, MonitorPlay, Sparkles, Zap, Star } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

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
      <div 
        className="fixed top-0 left-0 h-screen z-50 flex flex-col items-start transition-all duration-300 ease-in-out hidden md:flex"
        style={{ width: isHovered ? '240px' : '90px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Background Gradient overlay */}
        <div 
           className={`absolute inset-0 bg-transparent backdrop-blur-md transition-opacity duration-300 pointer-events-none -z-10 ${
             isHovered ? 'opacity-100' : 'opacity-0'
           }`}
        />
        
        <div className="flex flex-col h-full w-full justify-center gap-6 overflow-hidden pl-7 py-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;
            
            return (
              <Link
                href={link.path}
                key={link.name}
                className={`flex items-center gap-5 group cursor-pointer w-full transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-[#8f98b0] hover:text-white'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center">
                  <Icon 
                    size={isHovered ? 20 : 24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-all duration-300 ${isHovered && isActive ? 'text-[#1f80e0]' : ''}`}
                  />
                </div>
                
                <span 
                  className={`text-[17px] font-semibold whitespace-nowrap transition-all duration-[400ms] origin-left ${
                    isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-8 scale-95 pointer-events-none'
                  } ${isActive ? 'text-white' : ''}`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Bar / Top Nav - simplified for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f1014]/90 backdrop-blur-md border-t border-gray-800 flex items-center justify-around py-4">
         {navLinks.slice(1, 6).map((link) => {
            const Icon = link.icon;
            const isActive = router.pathname === link.path;
            return (
              <Link href={link.path} key={link.name} className="flex flex-col items-center gap-1 text-[#8f98b0] hover:text-white">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : ''}/>
                <span className={`text-[10px] ${isActive ? 'text-white' : ''} whitespace-nowrap`}>{link.name}</span>
              </Link>
            )
         })}
      </nav>
    </>
  );
}

