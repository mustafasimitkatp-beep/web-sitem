import React from 'react';
import { SiteSettings } from '../../types';
import { ExternalLink, Megaphone, Settings } from 'lucide-react';

interface Props {
  settings: SiteSettings;
  onOpenSettings: () => void;
}

export const AdSidebar: React.FC<Props> = ({ settings, onOpenSettings }) => {
  const banner = settings.sidebarBanner;
  if (!banner.enabled) return null;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded tracking-wider uppercase">
            {banner.badge}
          </span>
          <button
            onClick={onOpenSettings}
            className="text-slate-500 hover:text-slate-300 transition"
            title="Reklamı Düzenle"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title}
            referrerPolicy="no-referrer"
            className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-800"
          />
        ) : (
          <div className="w-full h-28 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-xl mb-3 border border-indigo-900/40 flex flex-col items-center justify-center text-center p-3">
            <Megaphone className="w-7 h-7 text-indigo-400 mb-1 animate-pulse" />
            <div className="text-xs font-bold text-white">{banner.title}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sponsorluk & Tanıtım Alanı</div>
          </div>
        )}

        <h4 className="text-sm font-bold text-white mb-1 font-display">{banner.title}</h4>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{banner.subtitle}</p>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <a
          href={banner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition active:scale-95"
        >
          <span>{banner.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
