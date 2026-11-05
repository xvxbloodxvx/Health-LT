import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        title="Install Health LT as a home screen app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition active:scale-95"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 p-5 shadow-2xl text-zinc-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold">Install Health LT on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-zinc-300 space-y-2.5 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-zinc-100 flex-inline items-center gap-1"><Share2 className="w-3 h-3 inline text-blue-400" /> Share button</strong> in Safari’s bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <span>
                    Scroll down and select <strong className="text-zinc-100">Add to Home Screen</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                  <span>
                    Launch Health LT anytime directly from your phone screen with offline caching.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
