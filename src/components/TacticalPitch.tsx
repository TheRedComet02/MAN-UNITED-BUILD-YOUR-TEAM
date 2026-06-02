/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, UserCheck, HelpCircle } from 'lucide-react';
import { SquadPlayer } from '../types';

interface TacticalPitchProps {
  startingXI: SquadPlayer[];
  onPlayerClick?: (player: SquadPlayer) => void;
  selectedPlayerId?: string | null;
  draggedOverTargetName?: string | null;
  onReplacePlayer?: (playerId: string) => void;
  replacementActive?: string | null; // Name of scout target ready to replace
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  startingXI,
  onPlayerClick,
  selectedPlayerId,
  onReplacePlayer,
  replacementActive,
}) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-[#141414] border border-white/5 rounded-2xl overflow-hidden p-4 shadow-2xl shadow-black/80">
      
      {/* Interactive tactical neon football pitch overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-20 pointer-events-none">
        {/* Outer pitch boundary */}
        <div className="w-full h-full border-2 border-[#DA291C]/20 rounded flex flex-col justify-between relative">
          
          {/* Top Penalty Box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[18%] border-b-2 border-r-2 border-l-2 border-[#DA291C]/20">
            {/* Top Goal */}
            <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-1/3 h-2 border-2 border-t-0 border-white/10"></div>
            {/* Penalty spot */}
            <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#DA291C]/30 rounded-full"></div>
            {/* D-arc */}
            <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[30%] h-[30%] border-b-2 border-[#DA291C]/20 rounded-b-full"></div>
          </div>
 
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#DA291C]/20 -translate-y-1/2"></div>
          
          {/* Centre Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] aspect-square border-2 border-[#DA291C]/20 rounded-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#DA291C]/30 rounded-full"></div>
          </div>
 
          {/* Bottom Penalty Box */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[18%] border-t-2 border-r-2 border-l-2 border-[#DA291C]/20">
            {/* Penalty spot */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#DA291C]/30 rounded-full"></div>
            {/* D-arc */}
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[30%] h-[30%] border-t-2 border-[#DA291C]/20 rounded-t-full"></div>
          </div>
 
        </div>
      </div>
 
      {/* Grid background scanning effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(ellipse at center, rgba(218, 41, 28, 0.2) 0%, transparent 70%), linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 20px 20px, 20px 20px'
        }}
      />

      {/* Dynamic Header */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-united-red animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">Carrington Tactical Board</span>
        </div>
        {replacementActive && (
          <div className="bg-united-red/10 border border-united-red/30 px-3 py-1 rounded bg-black/60 backdrop-blur-md flex items-center gap-1.5 pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-united-red animate-spin-slow" />
            <span className="text-[10px] uppercase tracking-wide font-medium text-united-red font-mono">
              Ready to Slot In: {replacementActive}
            </span>
          </div>
        )}
      </div>

      {/* Starting XI Positioning layer */}
      <div className="relative w-full h-full">
        {startingXI.map((player) => {
          const isSelected = selectedPlayerId === player.id;
          const isScoutTarget = player.id.startsWith("scout-");

          return (
            <motion.button
              key={player.id}
              id={`player-${player.id}`}
              onClick={() => {
                if (replacementActive) {
                  onReplacePlayer?.(player.id);
                } else if (onPlayerClick) {
                  onPlayerClick(player);
                }
              }}
              style={{
                left: `${player.x}%`,
                top: `${player.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute flex flex-col items-center group transition-all duration-300 ${
                replacementActive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              whileHover={{ y: -4 }}
            >
              {/* Outer halo / glowing ring based on condition */}
              <div className={`relative flex items-center justify-center rounded-full transition-all duration-300 p-0.5 ${
                isScoutTarget 
                  ? 'bg-gradient-to-r from-united-red to-amber-500 shadow-lg shadow-united-red/20' 
                  : isSelected
                    ? 'ring-2 ring-united-gold ring-offset-2 ring-offset-[#141414] scale-105'
                    : replacementActive
                      ? 'ring-2 ring-dashed ring-united-red/50 hover:ring-united-red'
                      : 'hover:ring-1 hover:ring-united-gold/50'
              }`}>
                {/* Player badge disk */}
                <div className={`w-11 h-11 md:w-13 md:h-13 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors border ${
                  isScoutTarget
                    ? 'bg-[#1A1A1A] border-united-red'
                    : isSelected
                      ? 'bg-united-gold border-united-gold text-neutral-950'
                      : replacementActive
                        ? 'bg-[#141414] border-united-red/40 group-hover:bg-united-red/10'
                        : 'bg-[#0A0A0A] border-white/5 group-hover:border-united-gold'
                }`}>
                  <span className={`text-[11px] md:text-xs font-bold tracking-tight ${
                    isSelected ? 'text-neutral-950' : isScoutTarget ? 'text-amber-400' : 'text-[#F5F5F5]'
                  }`}>
                    {player.rating}
                  </span>
                  
                  {isScoutTarget ? (
                    <UserCheck className="w-3.5 h-3.5 text-united-red" />
                  ) : (
                    <span className="font-mono text-[8px] opacity-65 uppercase text-neutral-350">{player.position}</span>
                  )}
                </div>

                {/* Replacement prompt hover disk */}
                {replacementActive && (
                  <div className="absolute inset-0 bg-united-red/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider font-mono">SWAP</span>
                  </div>
                )}
              </div>

              {/* Player details tag below */}
              <div className="mt-1 flex flex-col items-center max-w-[80px] md:max-w-[100px]">
                <div className={`text-[9px] md:text-[10px] font-medium truncate tracking-tight text-center px-1 py-0.5 rounded ${
                  isScoutTarget 
                    ? 'bg-united-red/20 text-amber-300 font-semibold border border-united-red/30' 
                    : isSelected 
                      ? 'bg-united-gold/20 text-united-gold border border-united-gold/30' 
                      : 'text-neutral-300 group-hover:text-white'
                }`}>
                  {player.name}
                </div>
                <div className="text-[8px] text-neutral-500 truncate mt-0.5 uppercase tracking-wide">
                  {player.role}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend & Instructions overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] text-neutral-400 font-mono select-none">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-united-gold" /> Base XI
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-united-red" /> Scout Targets
          </span>
        </div>
        <div className="hidden sm:block">
          {replacementActive ? "Click any player position to complete rebuild slot" : "Select a target & use Rebuild slot to model"}
        </div>
      </div>

    </div>
  );
};
