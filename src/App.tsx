/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Shield, 
  Sparkles, 
  Trophy, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Clock,
  History,
  AlertTriangle,
  Info,
  UserPlus
} from 'lucide-react';
import { SquadPlayer, TransferTarget, ScoutResponse } from './types';
import { INITIAL_SQUAD, PRESET_SCENARIOS } from './data';
import { TacticalPitch } from './components/TacticalPitch';
import { ScoutCard } from './components/ScoutCard';
import { ComparisonMatrix } from './components/ComparisonMatrix';

export default function App() {
  // Application States
  const [squad, setSquad] = useState<SquadPlayer[]>(() => {
    const saved = localStorage.getItem('united_scout_squad');
    return saved ? JSON.parse(saved) : INITIAL_SQUAD;
  });

  const [targets, setTargets] = useState<TransferTarget[]>([]);
  const [tacticalAnalysis, setTacticalAnalysis] = useState<string>('');
  
  const [customQuery, setCustomQuery] = useState<string>('');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [activeDraftingTarget, setActiveDraftingTarget] = useState<string | null>(null);
  
  const [signedNames, setSignedNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('united_scout_signed');
    return saved ? JSON.parse(saved) : [];
  });

  const [transferBudget, setTransferBudget] = useState<number>(() => {
    const saved = localStorage.getItem('united_scout_budget');
    return saved ? Number(saved) : 160; // Initial transfer budget £160M
  });

  const [tacticalIndex, setTacticalIndex] = useState<number>(() => {
    const saved = localStorage.getItem('united_scout_index');
    return saved ? Number(saved) : 78; // Start at 78/100
  });

  const [isScouting, setIsScouting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sourceIndicator, setSourceIndicator] = useState<string | null>(null);
  
  // Search Query History tracking
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('united_scout_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Clock state for dashboard authenticity
  const [utcTime, setUtcTime] = useState<string>('11:31:52 UTC');

  // Sync state with localstorage
  useEffect(() => {
    localStorage.setItem('united_scout_squad', JSON.stringify(squad));
  }, [squad]);

  useEffect(() => {
    localStorage.setItem('united_scout_signed', JSON.stringify(signedNames));
  }, [signedNames]);

  useEffect(() => {
    localStorage.setItem('united_scout_budget', transferBudget.toString());
  }, [transferBudget]);

  useEffect(() => {
    localStorage.setItem('united_scout_index', tacticalIndex.toString());
  }, [tacticalIndex]);

  useEffect(() => {
    localStorage.setItem('united_scout_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger default preset on load to avoid an empty dashboard
  useEffect(() => {
    handleScout(PRESET_SCENARIOS[0].query, PRESET_SCENARIOS[0].id);
  }, []);

  // Price solver utility: (£45M - £55M) -> average 50
  const parseCost = (costStr: string): number => {
    const matches = costStr.match(/\d+/g);
    if (matches && matches.length > 0) {
      const nums = matches.map(Number);
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    return 45; // Default average fallback
  };

  // Run scouting intelligence
  const handleScout = async (queryText: string, scenarioId: string | null = null) => {
    if (!queryText.trim()) return;

    setIsScouting(true);
    setErrorMessage(null);
    setActiveScenarioId(scenarioId);
    setActiveDraftingTarget(null);

    try {
      const resp = await fetch('/api/scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          presetId: scenarioId
        })
      });

      if (!resp.ok) {
        throw new Error(`Scout server responded with status: ${resp.status}`);
      }

      const resData = await resp.json();
      if (resData.success && resData.data) {
        setTacticalAnalysis(resData.data.tactical_analysis);
        setTargets(resData.data.recommended_targets);
        setSourceIndicator(resData.source || 'gemini_api');

        // Append to query history if custom and unique
        if (!scenarioId && !history.includes(queryText)) {
          setHistory(prev => [queryText, ...prev.slice(0, 7)]);
        }
      } else {
        throw new Error(resData.error || 'Tactical analysis returned invalid structure.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Connecting to tactical scout failed. Reconnecting...');
    } finally {
      setIsScouting(false);
    }
  };

  // Sign transfer target
  const handleSignPlayer = (target: TransferTarget) => {
    if (signedNames.includes(target.player_name)) return;
    
    const cost = parseCost(target.estimated_cost);
    if (transferBudget < cost) {
      setErrorMessage(`Tactical budget insufficient to sign ${target.player_name}. Sell current players or model cheaper targets.`);
      return;
    }

    setTransferBudget(prev => Math.max(0, parseFloat((prev - cost).toFixed(1))));
    setSignedNames(prev => [...prev, target.player_name]);
    
    // Automatically prepare drafting onto pitch
    setActiveDraftingTarget(target.player_name);
  };

  // Complete drafting swap onto tactical pitch
  const handleReplacePlayerOnPitch = (playerIdToReplace: string) => {
    if (!activeDraftingTarget) return;

    const matchedTarget = targets.find(t => t.player_name === activeDraftingTarget);
    if (!matchedTarget) return;

    const originalPlayer = squad.find(p => p.id === playerIdToReplace);
    if (!originalPlayer) return;

    // Create a new simulated scout starting slot player
    const scoutNode: SquadPlayer = {
      id: `scout-${matchedTarget.player_name.toLowerCase().replace(/\s+/g, '-')}`,
      name: matchedTarget.player_name,
      position: originalPlayer.position,
      role: `United Fit • ${matchedTarget.key_stat.split(' ')[0]}`,
      rating: 83 + (matchedTarget.age < 23 ? 2 : 5),
      country: 'Shortlisted recruit',
      x: originalPlayer.x,
      y: originalPlayer.y,
    };

    setSquad(prev => prev.map(p => p.id === playerIdToReplace ? scoutNode : p));
    setActiveDraftingTarget(null);
    
    // Elevate tactical synergy and rating logic
    setTacticalIndex(prev => Math.min(100, prev + 5));
  };

  // Reset entire dashboard status
  const handleResetSquad = () => {
    setSquad(INITIAL_SQUAD);
    setSignedNames([]);
    setTransferBudget(160);
    setTacticalIndex(78);
    setActiveDraftingTarget(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col font-sans select-none antialiased">
      
      {/* Sleek Carrington Global Crimson-red Header Banner */}
      <header className="bg-gradient-to-r from-united-red to-united-crimson sticky top-0 z-30 px-6 sm:px-10 py-5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:rotate-90 duration-500">
              <div className="w-6 h-6 border-4 border-united-red rounded-sm rotate-45"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none text-white">
                  THE UNITED SCOUT
                </h1>
                <span className="text-[9px] uppercase font-mono tracking-widest bg-black/30 border border-white/20 text-white px-2 py-0.5 rounded">
                  Director Deck
                </span>
              </div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-85 text-white/90 mt-1">
                Director of Football Intelligence
              </p>
            </div>
          </div>

          {/* Right Clock and Clearance stats matched to design specs */}
          <div className="flex items-center gap-6 text-[11px] font-mono text-white/80 bg-black/25 border border-white/10 rounded-xl px-5 py-2.5 w-full md:w-auto justify-between">
            <div>UTC: <span className="text-white font-semibold">{utcTime}</span></div>
            <div className="hidden sm:block">STATUS: <span className="text-emerald-400 font-semibold uppercase animate-pulse">OPERATIONAL</span></div>
            <div>CLEARANCE: <span className="text-white font-semibold">LEVEL 5</span></div>
          </div>

        </div>
      </header>

      {/* Main Core Layout Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 flex flex-col gap-6 lg:gap-8">
        
        {/* Alerts / Error Warnings */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-united-red/10 border border-united-red/30 rounded-xl p-4 text-xs font-mono text-united-red flex items-start gap-2.5 shadow-lg shadow-united-red/5"
            >
              <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 animate-bounce" />
              <div className="flex-1">
                <span className="font-bold uppercase tracking-wider">Tactical Instruction Rejected:</span> {errorMessage}
              </div>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="text-neutral-400 hover:text-white transition-colors uppercase text-[10px] font-bold"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Control Grid: Presets & Carrington Pitch Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT: Commander's Form Controls (5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Rebuild Budget and Status Indicators */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-2xl shadow-black/60 flex flex-col gap-5">
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono tracking-widest text-[#DA291C] font-bold uppercase">Old Trafford Rebuild Status</span>
                <button
                  onClick={handleResetSquad}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-300 hover:text-white transition-all px-3 py-1.5 rounded-lg border border-white/5"
                  title="Restore default Carrington roster"
                >
                  <RefreshCw className="w-3 h-3" /> Revert XI
                </button>
              </div>

              {/* Status parameters visual indicators */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Simulated Budget */}
                <div className="bg-[#0A0A0A]/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-united-gold" /> Rebuild Budget
                    </span>
                    <h2 className="font-display font-black text-xl md:text-2xl text-white mt-1.5 tracking-tight">
                      £{transferBudget}M
                    </h2>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-1.5 mt-3.5 overflow-hidden">
                    <div 
                      className="bg-united-gold h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (transferBudget / 160) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Simulated Tactical Index Synergy */}
                <div className="bg-[#0A0A0A]/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-united-red" /> Tactical Synergy
                    </span>
                    <h2 className="font-display font-black text-xl md:text-2xl text-white mt-1.5 tracking-tight flex items-baseline gap-1">
                      {tacticalIndex} <span className="text-[10px] font-mono text-neutral-550">/100</span>
                    </h2>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-1.5 mt-3.5 overflow-hidden">
                    <div 
                      className="bg-united-red h-full rounded-full transition-all duration-500" 
                      style={{ width: `${tacticalIndex}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Form Input for Tactical search */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-2xl shadow-black/60">
              <h2 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-united-red" /> Command Chief Scout
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Submit a custom role specification, squad weakness, or tactical problem below and let the AI search active world talents.
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleScout(customQuery);
                }}
                className="mt-4 flex flex-col gap-3"
              >
                <div className="relative">
                  <textarea
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder='E.g., "I need a clinical centre-forward with elite physicality to hold up target play" or "Find a high-acceleration right winger who can track back."'
                    rows={4}
                    className="w-full text-xs bg-black/45 border border-white/5 rounded-xl p-3.5 text-white placeholder-neutral-550 focus:outline-none focus:border-united-red/80 focus:ring-1 focus:ring-united-red/30 transition-all resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isScouting || !customQuery.trim()}
                  className="w-full bg-gradient-to-r from-united-red to-[#8B1A12] hover:from-[#8B1A12] hover:to-united-red active:scale-[0.98] disabled:from-neutral-800 disabled:to-neutral-900 text-white disabled:text-neutral-500 text-xs font-mono uppercase font-bold tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-united-red/10 hover:shadow-united-red/25 transition-all flex items-center justify-center gap-2"
                >
                  {isScouting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting Report...
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-pulse" /> Dispatch Scout Query
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preset Scenarios Buttons */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-2xl shadow-black/60">
              <h2 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-united-gold" /> Critical Rebuild Targets
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Instantly investigate these pre-defined squad vulnerability problems detected by our tactical audit.
              </p>

              <div className="grid grid-cols-1 gap-2.5 mt-4">
                {PRESET_SCENARIOS.map((preset) => {
                  const isActive = activeScenarioId === preset.id;
                  
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleScout(preset.query, preset.id)}
                      disabled={isScouting}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 group ${
                        isActive
                          ? 'bg-[#0A0A0A] border-united-red shadow-md shadow-united-red/10'
                          : 'bg-[#0A0A0A]/45 border-white/5 hover:border-white/10 hover:bg-[#1A1A1A]/30'
                      }`}
                    >
                      <div className={`mt-0.5 p-2 rounded-lg border flex-shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-united-red/15 border-united-red/30 text-united-red' 
                          : 'bg-[#1A1A1A] border-white/5 text-neutral-400 group-hover:text-neutral-250'
                      }`}>
                        {preset.id === 'midfield' && <Activity className="w-4 h-4" />}
                        {preset.id === 'rightback' && <Shield className="w-4 h-4" />}
                        {preset.id === 'leftback' && <Sparkles className="w-4 h-4" />}
                        {preset.id === 'striker' && <Trophy className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {preset.label}
                        </h4>
                        <p className="text-[10px] text-neutral-450 mt-1 leading-normal">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History Deck */}
            {history.length > 0 && (
              <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 text-neutral-330">
                  <History className="w-4 h-4 text-neutral-450" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider">Search Operations Ledger</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 max-h-36 overflow-y-auto pr-1">
                  {history.map((histQuery, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCustomQuery(histQuery);
                        handleScout(histQuery);
                      }}
                      className="text-left py-1.5 px-2.5 rounded hover:bg-[#0A0A0A] text-[10px] text-neutral-450 hover:text-white transition-colors truncate font-mono"
                    >
                      › {histQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </section>

          {/* RIGHT: Carrington Pitch Visualizer (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-5 justify-between">
            
            <TacticalPitch 
              startingXI={squad}
              selectedPlayerId={null}
              onReplacePlayer={handleReplacePlayerOnPitch}
              replacementActive={activeDraftingTarget}
            />

            {/* Pitch interaction guide card */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex gap-3 text-xs leading-normal text-neutral-300 shadow-xl">
              <Info className="w-5 h-5 text-united-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">Managing Director Pitch Guide</p>
                <ol className="list-decimal list-inside mt-2 text-neutral-400 space-y-1.5">
                  <li>Analyze a squad problem or enter specifications in the left control deck.</li>
                  <li>Click <span className="text-[#DA291C] font-semibold">Seal Contract</span> below to sign world class recommendations into your team roster.</li>
                  <li>Draft signed assets onto the grass pitch by selecting <span className="text-white font-medium">Slot Into Pitch</span> and clicking the current player position you want to overhaul.</li>
                </ol>
              </div>
            </div>

          </section>

        </div>

        {/* SECTION: Scout Intelligence Output */}
        <section className="mt-4 flex flex-col gap-6">
          
          <div className="border-t border-neutral-800/60 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-united-red rounded animate-pulse" />
                <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest text-white">
                  Intelligence Feed • Recommended Targets
                </h2>
              </div>
              {sourceIndicator && (
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider bg-[#141414] border border-white/5 px-2.5 py-1 rounded">
                  System Core: {sourceIndicator}
                </span>
              )}
            </div>

            {/* Tactical Advice banner - Styled exactly like the Sleek Interface briefing card */}
            {tacticalAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border-l-4 border-united-red p-6 md:p-8 rounded-r-lg shadow-xl mb-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-united-red/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-united-red flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    Tactical Analysis Briefing
                  </h2>
                  <span className="text-[9px] font-mono bg-white/5 opacity-80 px-2.5 py-1 rounded text-neutral-300">
                    REF: {activeScenarioId ? `${activeScenarioId.toUpperCase()}_REBUILD_09` : 'CUSTOM_QUERY_ALIGN'}
                  </span>
                </div>
                <p className="text-base md:text-xl font-light leading-relaxed text-neutral-200 relative z-10">
                  {tacticalAnalysis.replace(/\[Director's Note: Active Offline Backup\]\s*/g, '')}
                </p>
              </motion.div>
            )}

            {/* Player targets roster */}
            {isScouting ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                {[1, 2, 3].map((placeholder) => (
                  <div 
                    key={placeholder}
                    className="bg-neutral-900/40 border border-neutral-850 rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-neutral-800 rounded w-1/2" />
                      <div className="h-3 bg-neutral-800 rounded w-1/3" />
                      <div className="h-10 bg-neutral-800 rounded w-full mt-4" />
                    </div>
                    <div className="h-8 bg-neutral-800 rounded w-full mt-6" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {targets.map((target) => {
                  const avgCost = parseCost(target.estimated_cost);
                  const isSigned = signedNames.includes(target.player_name);
                  const isDraftingActive = activeDraftingTarget === target.player_name;
                  const budgetTooLow = transferBudget < avgCost;

                  return (
                    <ScoutCard
                      key={target.player_name}
                      target={target}
                      onDraftModeToggle={(name) => {
                        if (activeDraftingTarget === name) {
                          setActiveDraftingTarget(null);
                        } else {
                          setActiveDraftingTarget(name);
                        }
                      }}
                      onSignPlayer={handleSignPlayer}
                      isDraftingActive={isDraftingActive}
                      isSigned={isSigned}
                      budgetTooLow={budgetTooLow}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION: Deep Comparison Panel */}
          {!isScouting && targets.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <ComparisonMatrix targets={targets} />
            </motion.div>
          )}

        </section>

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-neutral-900/60 bg-neutral-950 mt-auto py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-neutral-500 font-mono">
            © 2026 THE UNITED SCOUT • CARRINGTON SYSTEM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-4 text-[10px] font-mono text-neutral-450">
            <span>TACTICAL VERDICT: OLD TRAFFORD REBUILD PROCESS ACTIVE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
