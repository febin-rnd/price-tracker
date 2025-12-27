
import React from 'react';
import { Product } from '../types';
import PriceChart from './PriceChart';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onRefresh }) => {
  const isTargetMet = product.currentPrice <= product.targetPrice;
  const initialPrice = product.history[0]?.price || product.currentPrice;
  const totalChange = ((product.currentPrice - initialPrice) / initialPrice) * 100;
  
  const lastCheckedStr = product.lastChecked 
    ? new Date(product.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 overflow-hidden group neon-border ${isTargetMet ? 'border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'border-white/5 hover:border-cyan-500/30'}`}>
      {/* Module ID & Platform */}
      <div className="px-6 py-4 flex justify-between items-center bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-3">
            <span className="mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                ID_{product.id.substring(0,6).toUpperCase()}
            </span>
            <div className={`w-2 h-2 rounded-full ${isTargetMet ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse' : 'bg-slate-700'}`}></div>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mono">Checked: {lastCheckedStr}</span>
        </div>
        <div className="flex gap-4">
            <button onClick={() => onRefresh(product.id)} className="text-slate-500 hover:text-cyan-400 transition-colors text-xs">
              <i className="fa-solid fa-sync"></i>
            </button>
            <button onClick={() => onDelete(product.id)} className="text-slate-500 hover:text-rose-400 transition-colors text-xs">
              <i className="fa-solid fa-trash-can"></i>
            </button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex gap-6 items-start mb-6">
          <div className="w-24 h-24 rounded-3xl bg-black/40 border border-white/10 p-2 flex-shrink-0 relative overflow-hidden group-hover:border-cyan-500/50 transition-colors">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-lighten grayscale hover:grayscale-0 transition-all duration-700" 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black text-cyan-500 uppercase tracking-widest border border-white/5">{product.platform}</span>
            </div>
            <h3 className="font-bold text-white text-base leading-tight line-clamp-2 mono mb-3 tracking-tight group-hover:text-cyan-300 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white mono tracking-tighter">
                  {product.currency}{product.currentPrice.toLocaleString()}
                </span>
                <span className={`text-[10px] font-bold mono px-2 py-1 rounded bg-black/20 ${totalChange <= 0 ? 'text-cyan-400 border border-cyan-400/20' : 'text-rose-400 border border-rose-400/20'}`}>
                  {totalChange <= 0 ? '' : '+'}{totalChange.toFixed(1)}%
                </span>
            </div>
          </div>
        </div>

        {/* Visual Data Feed */}
        <PriceChart data={product.history} currency={product.currency} />

        <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Strike Target</p>
                <p className="mono text-lg font-black text-white">{product.currency}{product.targetPrice.toLocaleString()}</p>
            </div>
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Grid Status</p>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isTargetMet ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {isTargetMet ? 'ACQUIRED' : 'SURVEILLANCE'}
                    </span>
                    {isTargetMet && <i className="fa-solid fa-bolt text-cyan-400 text-[10px] animate-pulse"></i>}
                </div>
            </div>
        </div>

        <a 
          href={product.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`mt-8 flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${isTargetMet ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 border-white/5'}`}
        >
          INTERCEPT SOURCE <i className="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
