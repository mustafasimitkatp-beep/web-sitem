import React from 'react';
import { SiteSettings } from '../../types';
import { ExternalLink, Sparkles, Settings } from 'lucide-react';

interface Props {
  settings: SiteSettings;
  onOpenSettings: () => void;
}

export const AdBannerTop: React.FC<Props> = ({ settings, onOpenSettings }) => {
  const banner = settings.topBanner;
  if (!banner.enabled) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border-y border-slate-800/80 px-4 py-2.5 backdrop-blur">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
            {banner.badge}
          </span>
          <div className="flex items-center gap-2 text-slate-200">
            <span className="font-semibold text-white">{banner.title}</span>
            <span className="hidden md:inline text-slate-400">·</span>
            <span className="hidden md:inline text-slate-400">{banner.subtitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-md transition shadow-sm"
          >
            <span>{banner.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onOpenSettings}
            className="p-1 text-slate-500 hover:text-slate-300 transition"
            title="Reklamı veya Logoyu Düzenle"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
