import { useState, useEffect, useCallback, useRef } from 'react';

export interface RestTimerState {
  active: boolean;
  targetTime: number | null;
  secondsLeft: number;
  label: string;
}

export function useRestTimer() {
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    targetTime: null,
    secondsLeft: 0,
    label: ''
  });

  // Keep a reference to the unlocked AudioContext for mobile web browsers
  const audioContextRef = useRef<AudioContext | null>(null);

  // Unlocks audio context on user interaction (touch/click)
  const unlockAudio = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (err) {
      console.warn('Audio Context unlock warning:', err);
    }
  }, []);

  const playBeep = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([200, 100, 200]);
      }

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      let ctx = audioContextRef.current;
      if (!ctx) {
        ctx = new AudioContextClass();
        audioContextRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn('Audio Context beep warning:', err);
    }
  }, []);

  const startRestTimer = useCallback((seconds: number, label = 'Rest') => {
    // User interacted: unlock audio context immediately
    unlockAudio();

    setRestTimer({
      active: true,
      targetTime: Date.now() + seconds * 1000,
      secondsLeft: seconds,
      label
    });
  }, [unlockAudio]);

  const dismissRestTimer = useCallback(() => {
    setRestTimer({ active: false, targetTime: null, secondsLeft: 0, label: '' });
  }, []);

  useEffect(() => {
    if (!restTimer.active || !restTimer.targetTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((restTimer.targetTime! - Date.now()) / 1000));
      if (remaining <= 0) {
        playBeep();
        setRestTimer({ active: false, targetTime: null, secondsLeft: 0, label: '' });
        clearInterval(interval);
      } else {
        setRestTimer((prev) => ({ ...prev, secondsLeft: remaining }));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.targetTime, playBeep]);

  return {
    restTimer,
    startRestTimer,
    dismissRestTimer
  };
}
