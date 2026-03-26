import { useShouldShowAds } from '@/contexts/AdContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

// Reusable Ad Banner component that respects user ad preferences
export default function AdBanner({ 
  position = 'bottom', // 'top', 'bottom', 'sidebar', 'inline'
  size = 'standard', // 'small', 'standard', 'large', 'fullscreen'
  className = ''
}) {
  const { shouldShowAds, isLoading } = useShouldShowAds();
  const [ad, setAd] = useState(null);
  const [ads, setAds] = useState([]);

  // Fetch ads from Supabase
  useEffect(() => {
    if (!shouldShowAds || isLoading) return;

    const fetchAds = async () => {
      try {
        const { data } = await supabase
          .from('ads')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          setAds(data);
          // Use the fetched ads array
          const adsList = data;
          // Pick a random ad or the most recent one
          const randomAd = adsList[Math.floor(Math.random() * adsList.length)];
          setAd(randomAd);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
      }
    };

    fetchAds();
  }, [shouldShowAds, isLoading]);

  // Don't render anything if user shouldn't see ads or still loading
  if (isLoading || !shouldShowAds) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    small: 'w-[300px] h-[100px]',
    standard: 'w-full max-w-[728px] h-[90px]',
    large: 'w-full max-w-[970px] h-[250px]',
    fullscreen: 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center'
  };

  // Position classes
  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-40',
    bottom: 'fixed bottom-0 left-0 right-0 z-40',
    sidebar: 'sticky top-20',
    inline: ''
  };

  const containerClasses = `
    ${sizeClasses[size] || sizeClasses.standard}
    ${positionClasses[position] || ''}
    ${className}
  `.trim();

  if (!ad) {
    // Fallback ad display if no ads in database
    return (
      <div className={containerClasses}>
        <div className="w-full h-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          <span>Advertisement</span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {ad.type === 'image' && (
        <a 
          href={ad.link || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img 
            src={ad.content} 
            alt={ad.title} 
            className="w-full h-full object-cover rounded-lg"
          />
        </a>
      )}
      
      {ad.type === 'video' && (
        <video 
          src={ad.content} 
          className="w-full h-full object-cover rounded-lg" 
          muted 
          loop 
          autoPlay 
          playsInline
        />
      )}
      
      {ad.type === 'html' && (
        <div 
          className="w-full h-full rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      )}
      
      {(ad.type === 'admob' || ad.type === 'adsterra') && (
        <div 
          className="w-full h-full rounded-lg overflow-hidden bg-black/50 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      )}

      {/* Close button for fullscreen ads */}
      {size === 'fullscreen' && (
        <button 
          onClick={() => setAd(null)}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Skip Ad
        </button>
      )}
    </div>
  );
}

// Hook to check if ads should be shown (for use in other components)
export { useShouldShowAds };
