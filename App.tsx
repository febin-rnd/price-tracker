
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, AppView, PricePoint } from './types';
import { extractProductData, checkPriceUpdate } from './services/geminiService';
import ProductCard from './components/ProductCard';

const SCAN_INTERVAL_MS = 3600000; // 1 Hour

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success' | 'warn' | 'alert'}[]>([]);
  
  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'warn' | 'alert' = 'info') => {
    setLogs(prev => [{ 
      msg, 
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type
    }, ...prev].slice(0, 8));
  }, []);

  // Request Notification Permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const triggerNotification = (product: Product, newPrice: number) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("NEURAL TARGET ACQUIRED", {
        body: `${product.name} dropped to ${product.currency}${newPrice.toLocaleString()}!`,
        icon: product.imageUrl
      });
    }
    addLog(`NOTIFICATION DISPATCHED: ${product.name.substring(0, 15)}`, 'alert');
  };

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('sentinel_hq_v2');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setProducts(parsed);
      } catch (e) { console.error("Restore failed", e); }
    }
    addLog("Sentinel Intelligence HQ Online", "success");
    addLog("Hourly Monitoring Protocol Engaged", "info");
  }, [addLog]);

  // Save Data
  useEffect(() => {
    localStorage.setItem('sentinel_hq_v2', JSON.stringify(products));
  }, [products]);

  const updateProductPrice = useCallback((id: string, newPrice: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const isNowDeal = newPrice <= p.targetPrice;
        const wasDeal = p.isDeal;
        
        if (isNowDeal && !wasDeal) {
          triggerNotification(p, newPrice);
        }

        const newHistory: PricePoint[] = [...p.history, { timestamp: Date.now(), price: newPrice }];
        return {
          ...p,
          currentPrice: newPrice,
          history: newHistory,
          lastUpdated: Date.now(),
          lastChecked: Date.now(),
          nextCheck: Date.now() + SCAN_INTERVAL_MS,
          isDeal: isNowDeal
        };
      }
      return p;
    }));
  }, [addLog]);

  // Background Hourly Scraper logic
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const needsCheck = products.filter(p => now >= (p.nextCheck || 0));
      
      if (needsCheck.length === 0) return;

      for (const p of needsCheck) {
        addLog(`Auto-Scraping: ${p.name.substring(0, 15)}`, "info");
        try {
          const result = await checkPriceUpdate(p.name, p.url);
          if (result.price > 0) {
            updateProductPrice(p.id, result.price);
            addLog(`Node Sync: ${p.currency}${result.price}`, result.price !== p.currentPrice ? "success" : "info");
          }
        } catch (e) {
          addLog(`Sync Blocked: Channel Interference`, "warn");
        }
      }
    }, 60000); // Check the queue every minute for hourly scheduling
    return () => clearInterval(interval);
  }, [products, updateProductPrice, addLog]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || targetPrice <= 0) return;
    setLoading(true);
    setError(null);
    addLog("Infiltrating e-commerce endpoint...", "info");

    try {
      const data = await extractProductData(newUrl);
      const newProduct: Product = {
        id: Math.random().toString(36).substring(7),
        url: newUrl,
        name: data.name,
        imageUrl: data.imageUrl,
        currentPrice: data.price,
        currency: data.currency,
        targetPrice: targetPrice,
        history: [{ timestamp: Date.now(), price: data.price }],
        platform: data.platform,
        lastUpdated: Date.now(),
        lastChecked: Date.now(),
        nextCheck: Date.now() + SCAN_INTERVAL_MS,
        isDeal: data.price <= targetPrice,
        status: 'active'
      };
      setProducts(prev => [newProduct, ...prev]);
      setIsAdding(false);
      setNewUrl('');
      setTargetPrice(0);
      addLog(`New Intelligence Node: ${data.name.substring(0, 15)}`, "success");
      
      if (newProduct.isDeal) triggerNotification(newProduct, data.price);
    } catch (err: any) {
      setError(err.message || "Endpoint unreachable");
      addLog("Extraction failure", "warn");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#020617] relative">
      {/* Sidebar Command Panel */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-950 border-r border-white/5 sticky top-0 h-screen z-50 overflow-y-auto no-scrollbar">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12 group cursor-default">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <i className="fa-solid fa-radar text-2xl animate-pulse"></i>
            </div>
            <div>
                <span className="font-black text-xl tracking-tighter text-white block">SENTINEL</span>
                <span className="text-[10px] font-bold text-cyan-400 tracking-[0.3em] -mt-1 block">NEURAL_NET</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: AppView.DASHBOARD, icon: 'fa-microchip', label: 'Surveillance' },
              { id: AppView.ANALYTICS, icon: 'fa-brain', label: 'Intelligence' },
              { id: AppView.ALERTS, icon: 'fa-satellite-dish', label: 'Alerts' },
              { id: AppView.SETTINGS, icon: 'fa-gears', label: 'Sub-Systems' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === item.id ? 'sidebar-item-active' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <i className={`fa-solid ${item.icon} text-lg`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Console Activity Feed */}
        <div className="mt-auto p-6">
          <div className="bg-black/60 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Terminal</h4>
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            </div>
            <div className="space-y-4 max-h-80 overflow-hidden">
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-left-4 duration-500`}>
                  <div className="text-[8px] font-bold text-slate-600 mt-0.5 mono whitespace-nowrap">[{log.time}]</div>
                  <div className={`text-[10px] font-bold mono leading-tight line-clamp-2 ${log.type === 'success' ? 'text-cyan-400' : log.type === 'warn' ? 'text-rose-400' : log.type === 'alert' ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                    {log.type === 'success' ? '> ' : log.type === 'warn' ? '! ' : log.type === 'alert' ? '* ' : '# '}{log.msg}
                  </div>
                </div>
              )) : (
                <div className="text-[10px] text-slate-600 mono italic tracking-tight">System idle... awaiting signals.</div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto no-scrollbar relative z-10">
        <header className="h-24 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40 flex items-center justify-between px-10">
          <div className="flex items-center flex-1 max-w-2xl">
             <div className="relative w-full group">
               <input 
                type="text" 
                placeholder="ID SEARCH / TAG FILTRATION..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-cyan-50 mono focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-700 uppercase tracking-widest"
               />
               <i className="fa-solid fa-fingerprint absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/40 text-lg"></i>
             </div>
          </div>
          
          <div className="flex items-center gap-6 ml-8">
             <button 
                onClick={() => setIsAdding(true)}
                className="h-12 px-8 bg-cyan-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-3"
             >
               <i className="fa-solid fa-crosshairs text-lg"></i>
               Deploy Monitor
             </button>
          </div>
        </header>

        <div className="p-10">
          <div className="mb-12">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic glitch-text">Active Operations</h2>
            <div className="flex items-center gap-3 mt-2">
                <span className="w-12 h-1 bg-cyan-500"></span>
                <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em]">Global Monitoring Grid</p>
            </div>
          </div>

          {/* Module Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-950/40 rounded-[3rem] border border-dashed border-white/5">
              <i className="fa-solid fa-satellite text-6xl text-cyan-500/20 mb-8 animate-pulse"></i>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Grid Offline</h3>
              <p className="text-slate-500 mb-10 max-w-sm text-center font-bold text-sm leading-relaxed mono opacity-60">
                No active monitoring nodes detected. Deploy your first surveillance module.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDelete={(id) => {
                    setProducts(prev => prev.filter(p => p.id !== id));
                    addLog(`Node decommissioned: ${id.substring(0,6)}`, "warn");
                  }}
                  onRefresh={async (id) => {
                    setLoading(true);
                    try {
                      const p = products.find(prod => prod.id === id);
                      if (!p) return;
                      const update = await checkPriceUpdate(p.name, p.url);
                      if (update.price > 0) {
                        updateProductPrice(id, update.price);
                        addLog(`Manual Sync complete`, "success");
                      }
                    } catch (e) {
                      addLog(`Sync failure`, "warn");
                    } finally { setLoading(false); }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Deployment Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => !loading && setIsAdding(false)} />
          <div className="relative bg-slate-950 w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(34,211,238,0.1)] border border-white/10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-12">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-8">Deploy Monitor</h2>
              <form onSubmit={handleAddProduct} className="space-y-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-2">Market Link (eBay/Amazon/Etc)</label>
                  <input 
                    required disabled={loading} type="url" 
                    className="w-full px-6 py-5 bg-black border border-white/10 rounded-[1.5rem] focus:ring-1 focus:ring-cyan-500/50 outline-none text-cyan-100 mono text-sm"
                    value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-2">Strike Price Threshold</label>
                  <input 
                    required disabled={loading} type="number" 
                    className="w-full px-6 py-5 bg-black border border-white/10 rounded-[1.5rem] focus:ring-1 focus:ring-cyan-500/50 outline-none text-cyan-100 mono text-sm"
                    value={targetPrice || ''} onChange={(e) => setTargetPrice(Number(e.target.value))}
                  />
                </div>
                {error && <p className="text-rose-400 text-xs font-bold mono">! {error}</p>}
                <button 
                  type="submit" disabled={loading}
                  className="w-full py-6 bg-cyan-500 text-black rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'INITIALIZING...' : 'START MONITORING'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading && !isAdding && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] px-10 py-5 bg-cyan-500 text-black rounded-2xl shadow-xl animate-bounce border border-white/20">
          <span className="text-xs font-black uppercase tracking-widest">Neural Syncing...</span>
        </div>
      )}
    </div>
  );
};

export default App;
