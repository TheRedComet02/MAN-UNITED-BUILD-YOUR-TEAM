/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TransferTarget {
  player_name: string;
  current_club: string;
  age: number;
  estimated_cost: string;
  why_they_fit: string;
  key_stat: string;
  // Client-side extension properties
  signed?: boolean;
}

export interface ScoutResponse {
  tactical_analysis: string;
  recommended_targets: TransferTarget[];
}

export interface SquadPlayer {
  id: string;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  role: string;
  rating: number;
  country: string;
  x: number; // Pitch layout percentage coordinate from left (0-100)
  y: number; // Pitch layout percentage coordinate from top (0-100)
}

export interface PresetScenario {
  id: string;
  label: string;
  query: string;
  description: string;
  icon: string;
}
