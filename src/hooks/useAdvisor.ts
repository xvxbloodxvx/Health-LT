import { useState } from 'react';
import type { DayLedgerEntry } from '../types';
import { formatDateDDMM } from '../utils/nutrition';
import { getDefaultShiftForDate } from '../utils/shift';

interface UseAdvisorProps {
  currentDay: DayLedgerEntry;
  selectedDate: string;
  currentRoutineLabel: string;
}

export function useAdvisor({ currentDay, selectedDate, currentRoutineLabel }: UseAdvisorProps) {
  const [advisorQuestion, setAdvisorQuestion] = useState<string>('');
  const [isAdvisorThinking, setIsAdvisorThinking] = useState<boolean>(false);
  const [advisorHistory, setAdvisorHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; time: string }>
  >([
    {
      role: 'assistant',
      content:
        'Hello! Ask me any question regarding your keto diet, electrolytes, shift nutrition, or workout adjustments.',
      time: 'Ready'
    }
  ]);

  const handleAdvisorSubmit = () => {
    if (!advisorQuestion.trim()) return;
    const q = advisorQuestion.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAdvisorHistory((prev) => [...prev, { role: 'user', content: q, time: timeStr }]);
    setAdvisorQuestion('');
    setIsAdvisorThinking(true);

    setTimeout(() => {
      const cal = currentDay.calories || 0;
      const nc = currentDay.net_carbs || 0;
      const p = currentDay.protein || 0;
      const na = currentDay.sodium || 0;
      const k = currentDay.potassium || 0;
      const mg = currentDay.magnesium || 0;
      const shift = currentDay.shift || getDefaultShiftForDate(selectedDate);
      const wt = currentDay.weight_kg || 89.15;
      const qLower = q.toLowerCase();

      let answer = '';
      if (qLower.includes('plateau') || qLower.includes('weight') || qLower.includes('scale')) {
        answer = `Regarding your weight trend (latest: ${wt}kg):\n1. Fluid Dynamics: Glycogen depletion and sodium intake can mask true tissue loss by up to 1.5kg in water retention.\n2. Caloric Intake: Today you have logged ${cal} kcal. Ensure your weekly average stays in a sustainable deficit.\n3. Recommendation: Monitor your 7-day rolling weight rather than daily fluctuations, and ensure sodium stays around 2,500mg to prevent rebound fluid retention.`;
      } else if (
        qLower.includes('electrolyte') ||
        qLower.includes('salt') ||
        qLower.includes('sodium') ||
        qLower.includes('potassium') ||
        qLower.includes('magnesium')
      ) {
        answer = `Electrolyte breakdown for your ${shift} shift:\n• Sodium (Current: ${na}mg / 2,500mg): Salt your main meals liberally or take a broth cube before your shift.\n• Potassium (Current: ${k}mg / 3,500mg): Emphasize spinach, avocado, or potassium citrate.\n• Magnesium (Current: ${mg}mg / 420mg): Take magnesium glycinate before bed to support muscle relaxation and restorative sleep.`;
      } else if (
        qLower.includes('shift') ||
        qLower.includes('pm') ||
        qLower.includes('am') ||
        qLower.includes('standby') ||
        qLower.includes('night')
      ) {
        answer = `Shift Work Nutrition Strategy for ${shift}:\n• Standby / Rest: Keep carbs strictly under 30g net carbs to maintain fat oxidation without spikes in postprandial fatigue.\n• AM Shift (08:30–21:00): Consume your primary protein (${p}g currently logged) in your mid-day meal.\n• PM Shift (20:30–09:00): Avoid heavy solid meals between 02:00 and 06:00; rely on bone broth, electrolytes, and water to keep alertness high.`;
      } else if (
        qLower.includes('workout') ||
        qLower.includes('circuit') ||
        qLower.includes('exercise') ||
        qLower.includes('squat') ||
        qLower.includes('pull')
      ) {
        answer = `Workout optimization for ${currentRoutineLabel}:\n• Day 1 Circuit: Prioritize plank core stability (50s target) and strict pull-up form.\n• Day 2 Strength: Focus on controlled tempo (3-second eccentric) on slow bodyweight squats.\n• Day 3 Dumbbell: Keep goblet squat load stable at 5kg while progressive overloading reps to 15.\n• Recovery: Ensure 90s rest periods between heavy sets to allow full ATP resynthesis.`;
      } else {
        answer = `Advisor Analysis for ${formatDateDDMM(selectedDate)} (${shift}):\n• Nutritional Snapshot: ${cal} kcal, ${nc}g net carbs, ${p}g protein.\n• Micronutrients: Sodium: ${na}/2500mg, Potassium: ${k}/3500mg, Magnesium: ${mg}/420mg.\n• Focus: Maintain high hydration, adhere to your daily targets, and log all meals for accurate tracking.`;
      }

      setAdvisorHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAdvisorThinking(false);
    }, 350);
  };

  const clearAdvisorHistory = () => {
    setAdvisorHistory([
      {
        role: 'assistant',
        content:
          'History cleared. Ask me any question regarding your keto diet, electrolytes, shift nutrition, or workout adjustments.',
        time: 'Ready'
      }
    ]);
  };

  return {
    advisorQuestion,
    setAdvisorQuestion,
    isAdvisorThinking,
    advisorHistory,
    handleAdvisorSubmit,
    clearAdvisorHistory
  };
}
