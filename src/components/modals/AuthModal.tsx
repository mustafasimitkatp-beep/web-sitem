import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { X, User, LogIn, UserPlus, Sparkles, Check } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

const AVATARS = ['⚡', '👑', '🚀', '🛡️', '🌾', '🎮', '🎯', '🐉', '🤖', '🔥', '🌟', '👾'];

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar || '⚡');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Lütfen bir kullanıcı adı girin.');
      return;
    }

    sound.playCoin();

    const updatedUser: UserProfile = {
      ...currentUser,
      id: `usr_${Date.now()}`,
      username: username.trim(),
      avatar: selectedAvatar,
      isGuest: false,
      joinedAt: 'Bugün',
    };

    onLoginSuccess(updatedUser);
    onClose();
  };

  const handleGuestPlay = () => {
    sound.playPop();
    const guestUser: UserProfile = {
      ...currentUser,
      username: `Misafir_${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: '🎮',
      isGuest: true,
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {mode === 'login' ? 'Oyuncu Girişi' : 'Yeni Oyuncu Kaydı'}
              </h3>
              <p className="text-xs text-slate-400">Skorlarınızı kaydetmek ve sıralamaya girmek için giriş yapın.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800/80 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Oyuncu Avatarı Seçin</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => { setSelectedAvatar(av); sound.playPop(); }}
                  className={`h-10 text-xl rounded-xl flex items-center justify-center border transition-all ${
                    selectedAvatar === av
                      ? 'border-indigo-400 bg-indigo-950/80 scale-105 shadow-md ring-1 ring-indigo-400'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Örn: KralOyuncu, ProTankçı..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition active:scale-95"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{mode === 'login' ? 'Giriş Yap ve Skorları Kaydet' : 'Hesabı Oluştur & Oyna'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500">veya</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestPlay}
            className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            🎮 Misafir Olarak Hızlı Oyna
          </button>
        </form>
      </div>
    </div>
  );
};
