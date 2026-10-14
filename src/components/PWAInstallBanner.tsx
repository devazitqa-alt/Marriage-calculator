import React, { useState } from 'react';
import { Download, Smartphone, Check, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SoundEffects } from '../utils/audio';

interface PWAInstallBannerProps {
  onOpenDetailedModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenDetailedModal }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already running inside standalone PWA mode, show subtle verified badge or hide
  if (isInstalled) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">Installed as Native Standalone App</span>
        </div>
        <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-bold">Offline Ready</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    SoundEffects.playClick();
    if (isInstallable) {
      setInstalling(true);
      try {
        const result = await install();
        if (!result) {
          setShowAndroidGuide(true);
        }
      } catch {
        setShowAndroidGuide(true);
      } finally {
        setInstalling(false);
      }
    } else {
      // Browser didn't fire beforeinstallprompt yet or in iframe preview: show fast guide or modal
      setShowAndroidGuide(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-4 text-white shadow-lg shadow-red-600/20 border border-red-500 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white text-[#d32f2f] flex items-center justify-center font-black text-xl shadow-md border border-white">
            📱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide uppercase text-white">
                Install on Android Mobile
              </span>
              <span className="bg-amber-400 text-slate-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                STANDALONE APK
              </span>
            </div>
            <p className="text-[11px] text-red-100/90 mt-0.5 leading-snug">
              Add directly to your Android home screen & app drawer. Full-screen, offline, and zero browser bars!
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Action Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className="flex-1 py-3 px-4 bg-white hover:bg-red-50 active:scale-[0.98] text-[#d32f2f] rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4 text-[#d32f2f]" />
          <span>{installing ? 'Prompting Install...' : 'INSTALL APP'}</span>
        </button>

        {onOpenDetailedModal && (
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onOpenDetailedModal();
            }}
            className="py-3 px-3 bg-red-800/80 hover:bg-red-900/90 active:scale-[0.98] text-white rounded-xl font-bold text-xs border border-red-400/30 flex items-center justify-center"
            title="How to install / APK options"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inline Quick Android Guide if browser hasn't fired prompt */}
      {showAndroidGuide && (
        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/20 text-[11px] text-white space-y-2 animate-in fade-in duration-150">
          <div className="font-bold flex items-center justify-between">
            <span>How to install on Android Chrome:</span>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="text-red-200 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <ol className="space-y-1 text-red-100 text-[10px] list-decimal pl-4">
            <li>
              Open this app URL in <strong>Google Chrome</strong> on your phone.
            </li>
            <li>
              Tap the <strong>⋮</strong> (three vertical dots) menu at top right.
            </li>
            <li>
              Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
