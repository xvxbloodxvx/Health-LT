import React from 'react';
import { Bot, RefreshCw } from 'lucide-react';

interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface AdvisorTabProps {
  advisorHistory: AdvisorMessage[];
  advisorQuestion: string;
  isAdvisorThinking: boolean;
  onSetAdvisorQuestion: (val: string) => void;
  onClearHistory: () => void;
  onSubmitQuestion: () => void;
}

export const AdvisorTab: React.FC<AdvisorTabProps> = ({
  advisorHistory,
  advisorQuestion,
  isAdvisorThinking,
  onSetAdvisorQuestion,
  onClearHistory,
  onSubmitQuestion,
}) => {
  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-4 space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <Bot size={20} className="text-zinc-300" />
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Keto & Shift Advisor</h3>
            <p className="text-[10px] text-zinc-500">
              Ask any question regarding your nutrition, macros, electrolytes, or workouts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 cursor-pointer"
        >
          Clear History
        </button>
      </div>

      {/* Conversation Log */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {advisorHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 ml-6'
                : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 mr-2 whitespace-pre-line'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1.5 font-bold uppercase tracking-wider">
              <span>{msg.role === 'user' ? 'Your Question' : 'Advisor'}</span>
              <span>{msg.time}</span>
            </div>
            <div>{msg.content}</div>
          </div>
        ))}

        {isAdvisorThinking && (
          <div className="p-3.5 rounded-xl border bg-zinc-950/80 border-zinc-800 text-xs text-zinc-400 flex items-center space-x-2">
            <RefreshCw size={14} className="animate-spin text-zinc-500" />
            <span>Synthesizing response with your health ledger data...</span>
          </div>
        )}
      </div>

      {/* Open-ended Question Input */}
      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <div className="relative">
          <textarea
            value={advisorQuestion}
            onChange={(e) => onSetAdvisorQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmitQuestion();
              }
            }}
            placeholder="Type any question or notes here (e.g., questions on keto macros, shift electrolyte timing, fatigue management)..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono resize-none"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500">
          <span>Press Enter to send (Shift + Enter for newline)</span>
          <button
            type="button"
            onClick={onSubmitQuestion}
            disabled={isAdvisorThinking || !advisorQuestion.trim()}
            className="px-4 py-2 bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
          >
            {isAdvisorThinking ? <RefreshCw className="animate-spin" size={14} /> : <Bot size={14} />}
            <span>Ask Advisor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
