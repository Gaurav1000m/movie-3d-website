import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Target, PlusCircle, Trash2, Layout, Video, Image as ImageIcon, Code, Disc, Smartphone, Globe } from 'lucide-react';

export default function ManageAds() {
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({ title: '', type: 'image', content: '' });
  const [isAuthorized, setIsAuthorized] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user?.email !== 'gaurav1000m@gmail.com') {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    const fetchAds = async () => {
      const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
      if (data) setAds(data);
    };
    fetchAds();
  }, [isAuthorized]);

  const handleAddAd = async (e) => {
    e.preventDefault();
    if (!newAd.title || !newAd.content) return;
    
    const adData = {
      title: newAd.title,
      type: newAd.type,
      content: newAd.content
    };

    const { data, error } = await supabase.from('ads').insert([adData]).select();
    if (!error && data) {
      setAds([data[0], ...ads]);
      setNewAd({ title: '', type: 'image', content: '' });
    } else {
      console.error(error);
      alert('Failed to save ad. Ensure the ads table exists in Supabase.');
    }
  };

  const handleDeleteAd = async (id) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (!error) {
      setAds(ads.filter(ad => ad.id !== id));
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'image': return <ImageIcon size={20} className="text-blue-400" />;
      case 'video': return <Video size={20} className="text-red-400" />;
      case 'html': return <Code size={20} className="text-green-400" />;
      case 'admob': return <Smartphone size={20} className="text-yellow-400" />
      case 'adsterra': return <Globe size={20} className="text-purple-400" />
      default: return <Disc size={20} />;
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] pt-16 pb-24 md:pl-[100px] lg:pl-[120px] font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Manage Ads - Cineverse</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-6xl mt-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/30">
            <Target size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Ads Management</h1>
            <p className="text-[#a0a0a0] mt-2 font-medium">Create and manage advertisements shown on the 15-second player waiting screen.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add New Ad Form */}
          <div className="lg:col-span-1 border border-white/5 bg-[#0a0a0c] backdrop-blur-xl rounded-2xl p-6 shadow-2xl h-fit sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="text-indigo-500" /> Add New Campaign
            </h2>
            <form onSubmit={handleAddAd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Campaign Title</label>
                <input 
                  type="text" 
                  value={newAd.title}
                  onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                  placeholder="e.g., Summer Sale 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ad Type</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {['image', 'video', 'html', 'admob', 'adsterra'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAd({...newAd, type})}
                      className={`py-2 px-1 rounded-lg text-sm font-semibold capitalize transition-all border ${newAd.type === type ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-[#111] border-white/5 text-gray-500 hover:text-gray-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                   {newAd.type === 'admob' ? 'AdMob Ad Unit ID' : newAd.type === 'adsterra' ? 'Adsterra Ad Script' : newAd.type === 'html' ? 'Custom HTML/IFrame Snippet' : 'Media URL (Image/Video)'}
                 </label>
                 {(newAd.type === 'html' || newAd.type === 'adsterra') ? (
                   <textarea 
                     value={newAd.content}
                     onChange={(e) => setNewAd({...newAd, content: e.target.value})}
                     className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600 min-h-[120px] font-mono text-sm"
                     placeholder={newAd.type === 'adsterra' ? "Paste your Adsterra native banner/display script here" : "<iframe src='...' ></iframe>"}
                     required
                   />
                 ) : newAd.type === 'admob' ? (
                   <input 
                     type="text" 
                     value={newAd.content}
                     onChange={(e) => setNewAd({...newAd, content: e.target.value})}
                     className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                     placeholder="ca-app-pub-35766.../7377..."
                     required
                   />
                 ) : (
                   <input 
                     type="url" 
                     value={newAd.content}
                     onChange={(e) => setNewAd({...newAd, content: e.target.value})}
                     className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                     placeholder="https://example.com/banner.jpg"
                     required
                   />
                 )}
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                Launch Ad Campaign
              </button>
            </form>
          </div>

          {/* Active Ads List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layout className="text-gray-400" /> Active Campaigns ({ads.length})
            </h2>
            
            {ads.length === 0 ? (
               <div className="border border-white/5 border-dashed rounded-2xl py-24 text-center bg-[#0a0a0c]/50">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-300">No active ads</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">Add your first promotional campaign using the form. It will be randomly displayed on the 15-second waiting screen.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {ads.map((ad, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={ad.id} 
                      className="bg-[#111115] border border-white/5 rounded-xl overflow-hidden group hover:border-white/10 transition-colors"
                    >
                      <div className="aspect-video bg-[#050505] relative overflow-hidden flex items-center justify-center p-2 border-b border-white/5">
                        {ad.type === 'video' ? (
                           <video src={ad.content} className="w-full h-full object-cover rounded-md" muted loop autoPlay playsInline />
                        ) : ad.type === 'image' ? (
                           <img src={ad.content} className="w-full h-full object-cover rounded-md" alt={ad.title} />
                        ) : (
                           <div className="w-full h-full text-xs text-gray-500 font-mono break-all line-clamp-6 bg-[#0a0a0c] p-4 rounded-md overflow-hidden">
                             {ad.content}
                           </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                           {getTypeIcon(ad.type)} {ad.type}
                        </div>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between">
                         <div>
                           <h3 className="font-bold text-white text-base line-clamp-1">{ad.title}</h3>
                           <p className="text-xs text-gray-500 mt-1">Added: {new Date(ad.created_at || new Date()).toLocaleDateString()}</p>
                         </div>
                         <button 
                           onClick={() => handleDeleteAd(ad.id)}
                           className="text-gray-500 hover:text-red-500 bg-white/5 hover:bg-red-500/10 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                           title="Delete Campaign"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </motion.div>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
