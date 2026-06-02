/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Award, DollarSign, Activity, Sparkles, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { TransferTarget } from '../types';

interface ScoutCardProps {
  target: TransferTarget;
  onDraftModeToggle: (targetName: string) => void;
  onSignPlayer: (target: TransferTarget) => void;
  isDraftingActive: boolean;
  isSigned: boolean;
  budgetTooLow: boolean;
}

export const ScoutCard: React.FC<ScoutCardProps> = ({
  target,
  onDraftModeToggle,
  onSignPlayer,
  isDraftingActive,
  isSigned,
  budgetTooLow,
}) => {
  return (
    <motion.div
      layout
      id={`scout-card-${target.player_name.replace(/\s+/g, '-').toLowerCase()}`}
      className={`relative w-full rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between group ${
        isSigned
          ? 'bg-gradient-to-br from-[#1A1A1A] to-[#121212] border-united-gold/40 shadow-xl shadow-united-gold/5'
          : isDraftingActive
            ? 'bg-[#1A1A1A] border-united-red shadow-lg shadow-united-red/10'
            : 'bg-[#1A1A1A] border-white/5 hover:border-united-red/40'
      }`}
      whileHover={{ y: -4 }}
    >
      {/* Absolute ambient state glow */}
      <div 
        className="absolute bottom-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-[0.03] pointer-events-none"
        style={{
          backgroundColor: isSigned ? '#c29b38' : '#DA291C'
        }}
      />

      {/* Top Identity Segment matching the Sleek design layout */}
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-neutral-450 font-bold mb-1 font-mono">
              {isSigned ? 'Contract Sealed' : 'Transfer Target'}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-white leading-tight flex items-center gap-1.5">
              {target.player_name}
              {isSigned && (
                <Sparkles className="w-4 h-4 text-united-gold animate-bounce" />
              )}
            </h3>
            <p className="text-xs text-united-red font-semibold italic mt-1">
              {target.current_club}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{target.age}</div>
            <div className="text-[8px] uppercase tracking-widest opacity-50 text-neutral-400 font-mono">AGE</div>
          </div>
        </div>

        {/* Scout report text box modeled as premium box from design HTML */}
        <div className="space-y-4 mb-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-xs leading-relaxed text-gray-300">
              {target.why_they_fit}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] ${
              isSigned 
                ? 'bg-[#c29b38] shadow-[#c29b38]/50' 
                : budgetTooLow 
                  ? 'bg-rose-500 shadow-rose-500/50' 
                  : 'bg-emerald-500 shadow-emerald-500/50'
            }`} />
            <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-300">
              Est. Cost: <span className="text-white font-semibold">{target.estimated_cost}</span>
            </span>
          </div>
        </div>

        {/* Bottom Metrics section styled exactly like the Sleek template critical metric column */}
        <div className="pt-5 border-t border-white/5 mb-6">
          <div className="text-[9px] uppercase text-neutral-450 font-bold mb-1 italic font-mono">Key Scout Metric</div>
          <div className="text-3xl font-black text-white tracking-tight">
            {target.key_stat.split(' ').slice(0, 1).join(' ')}
          </div>
          <div className="text-[10px] font-medium opacity-75 uppercase tracking-tighter text-neutral-300 mt-0.5">
            {target.key_stat.split(' ').slice(1).join(' ')}
          </div>
        </div>
      </div>

      {/* Contract & Slot Buttons aligned inside layout */}
      <div className="pt-4 border-t border-white/5 flex gap-2 w-full mt-auto">
        <button
          onClick={() => onDraftModeToggle(target.player_name)}
          disabled={isSigned}
          className={`flex-1 text-[10px] font-mono uppercase font-bold tracking-wider py-2.5 px-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-1.5 ${
            isSigned
              ? 'bg-[#111] text-neutral-600 border-white/5 cursor-not-allowed'
              : isDraftingActive
                ? 'bg-united-red text-white border-united-red shadow-md shadow-united-red/20'
                : 'bg-transparent text-neutral-300 border-white/10 hover:border-united-red hover:bg-[#DA291C]/5'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          {isDraftingActive ? 'Cancel Swap' : 'Slot Pitch'}
        </button>

        <button
          onClick={() => onSignPlayer(target)}
          disabled={isSigned || budgetTooLow}
          className={`flex-1 text-[10px] font-mono uppercase font-bold tracking-wider py-2.5 px-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-1 ${
            isSigned
              ? 'bg-united-gold/15 text-united-gold border-united-gold/30'
              : budgetTooLow
                ? 'bg-[#111] text-neutral-550 border-white/5 cursor-not-allowed line-through'
                : 'bg-white text-neutral-950 border-white hover:bg-united-gold hover:border-united-gold'
          }`}
        >
          {isSigned ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-united-gold" /> Signed
            </>
          ) : budgetTooLow ? (
            'Low Limit'
          ) : (
            <>
              Seal terms <ChevronRight className="w-2.5 h-2.5" />
            </>
          )}
        </button>
      </div>

    </motion.div>
  );
};
