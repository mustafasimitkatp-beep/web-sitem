import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { X, Check, Megaphone, Image as ImageIcon, Sliders, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
}

export const AdSettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'logo' | 'topBanner' | 'sidebarBanner'>('logo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCoin();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white font-display">Logo & Reklam Yönetim Paneli</h3>
              <p className="text-xs text-slate-400">Web sitenizin logosunu ve reklam afişlerini buradan özelleştirin.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-4 pt-2">
          <button
            onClick={() => setActiveTab('logo')}
            className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
              activeTab === 'logo'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Site Logosu & Başlık
          </button>
          <button
            onClick={() => setActiveTab('topBanner')}
            className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
              activeTab === 'topBanner'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Üst Reklam Bandı (728x90)
          </button>
          <button
            onClick={() => setActiveTab('sidebarBanner')}
            className={`pb-2.5 px-3 text-xs font-semibold transition border-b-2 ${
              activeTab === 'sidebarBanner'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Yan Reklam Kutusu (300x250)
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'logo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Site Marka İsmi / Logo Metni
                </label>
                <input
                  type="text"
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  placeholder="Örn: MustafaGames, NovaArcade..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Slogan / Alt Başlık
                </label>
                <input
                  type="text"
                  value={formData.siteTagline}
                  onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                  placeholder="Örn: 5 Farklı Efsane Web Oyunu Platformu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Özel Logo Resim URL'si (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.customLogoUrl}
                  onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                  placeholder="https://... (Görsel bağlantısı)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Boş bırakırsanız modern dinamik ikon ve marka fontu kullanılır.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'topBanner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">Üst Reklam Bandını Etkinleştir</div>
                  <div className="text-[11px] text-slate-400">Sayfanın en üstünde sponsor duyurusu gösterir.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.topBanner.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topBanner: { ...formData.topBanner, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rozet / Etiket Metni</label>
                <input
                  type="text"
                  value={formData.topBanner.badge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topBanner: { ...formData.topBanner, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reklam Başlığı</label>
                <input
                  type="text"
                  value={formData.topBanner.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topBanner: { ...formData.topBanner, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama / Slogan</label>
                <input
                  type="text"
                  value={formData.topBanner.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topBanner: { ...formData.topBanner, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Yönlendirme Linki (URL)</label>
                  <input
                    type="text"
                    value={formData.topBanner.linkUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        topBanner: { ...formData.topBanner, linkUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Buton Yazısı</label>
                  <input
                    type="text"
                    value={formData.topBanner.ctaText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        topBanner: { ...formData.topBanner, ctaText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sidebarBanner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">Yan Reklam Kutusunu Etkinleştir</div>
                  <div className="text-[11px] text-slate-400">Oyun listesinin yanındaki 300x250 reklam kutusunu açar.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sidebarBanner.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sidebarBanner: { ...formData.sidebarBanner, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reklam Başlığı</label>
                <input
                  type="text"
                  value={formData.sidebarBanner.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sidebarBanner: { ...formData.sidebarBanner, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Açıklama / Metin</label>
                <textarea
                  rows={2}
                  value={formData.sidebarBanner.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sidebarBanner: { ...formData.sidebarBanner, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reklam Afiş Görseli URL'si</label>
                <input
                  type="text"
                  value={formData.sidebarBanner.imageUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sidebarBanner: { ...formData.sidebarBanner, imageUrl: e.target.value },
                    })
                  }
                  placeholder="https://... (Özel afiş görseli)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tıklama Linki</label>
                  <input
                    type="text"
                    value={formData.sidebarBanner.linkUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sidebarBanner: { ...formData.sidebarBanner, linkUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Buton Metni</label>
                  <input
                    type="text"
                    value={formData.sidebarBanner.ctaText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sidebarBanner: { ...formData.sidebarBanner, ctaText: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
