import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  QrCode, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { SoundEffects } from '../utils/audio';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.href;

  const handleCopyUrl = () => {
    SoundEffects.playClick();
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    SoundEffects.playClick();
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleDownloadFlutterSource = () => {
    SoundEffects.playClick();
    const link = document.createElement('a');
    link.href = '/flutter_marriage_app.zip';
    link.download = 'flutter_marriage_app.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#d32f2f] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#d32f2f] flex items-center justify-center font-bold text-lg shadow-sm">
              📱
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-tight">
                Run on Your Android Phone
              </h3>
              <p className="text-[11px] text-red-100">Direct 1-Tap Mobile App & APK Options</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/20 active:scale-95 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Method 1: Instant Native Android Installation (Zero download size, offline ready) */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Instant Android App Install (Recommended)</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                No APK File Needed
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              You can install this app directly on your Android phone right now. It adds an icon to your phone’s home screen and app drawer, launches in full screen without browser bars, and works 100% offline.
            </p>

            {isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-[#d32f2f] hover:bg-red-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install App on this Device</span>
              </button>
            ) : isInstalled ? (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>App is already installed on this device!</span>
              </div>
            ) : (
              <div className="bg-white p-2.5 rounded-lg border border-red-200/80 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-800">To install on your phone's screen:</div>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-[#d32f2f]">①</span>
                    <span>Open this app URL in Chrome on your Android mobile.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-[#d32f2f]">②</span>
                    <span>Tap the Chrome menu (the 3 dots <strong>⋮</strong> in top right).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-[#d32f2f]">③</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Share Link to Mobile */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] block">
              Open on your Android phone:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[10px] text-slate-600 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Flutter Android Source Code & APK Generation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Flutter Android APK Codebase</span>
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                Source Code
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              We have generated the complete Flutter Android codebase in the project at <code>/flutter_marriage_app/</code>. You can build the signed release APK with one command:
            </p>

            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] space-y-1">
              <div className="text-emerald-400 font-bold"># Inside flutter_marriage_app folder:</div>
              <div>flutter pub get</div>
              <div>flutter build apk --release</div>
              <div className="text-slate-400 text-[9px]">→ Generates: build/app/outputs/flutter-apk/app-release.apk</div>
            </div>

            <button
              onClick={handleDownloadFlutterSource}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Complete Flutter Project (.ZIP)</span>
            </button>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[10px] text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <span>🔌</span> Connecting via USB Cable:
              </span>
              <div>1. Connect your Android phone to your PC via USB cable.</div>
              <div>2. Enable <strong>USB Debugging</strong> in phone developer options.</div>
              <div>3. Unzip the downloaded project and run <code>flutter run --release</code> in terminal to automatically build and install the APK onto your phone!</div>
            </div>
          </div>

          {/* Method 3: 1-Click Cloud APK Generator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[11px]">
            <span className="font-bold text-slate-800 block">
              3. Generate an APK in 1 minute using PWABuilder (No coding needed):
            </span>
            <p className="text-slate-600 text-[10px]">
              You can paste this app's URL into <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">PWABuilder.com</a> (developed by Microsoft) and click <strong>"Build Android Package"</strong> to download a ready-to-install Android APK file directly to your phone!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-[#d32f2f] text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
