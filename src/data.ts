/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SquadPlayer, PresetScenario } from './types';

export const INITIAL_SQUAD: SquadPlayer[] = [
  {
    id: 'onana',
    name: 'André Onana',
    position: 'GK',
    role: 'Sweeper Keeper',
    rating: 84,
    country: 'Cameroon',
    x: 50,
    y: 84,
  },
  {
    id: 'dalot',
    name: 'Diogo Dalot',
    position: 'DF',
    role: 'Inverted Right Back',
    rating: 83,
    country: 'Portugal',
    x: 82,
    y: 66,
  },
  {
    id: 'yoro',
    name: 'Leny Yoro',
    position: 'DF',
    role: 'Covering Defender',
    rating: 80,
    country: 'France',
    x: 62,
    y: 69,
  },
  {
    id: 'martinez',
    name: 'Lisandro Martínez',
    position: 'DF',
    role: 'Ball Playing Center Back',
    rating: 84,
    country: 'Argentina',
    x: 38,
    y: 69,
  },
  {
    id: 'shaw',
    name: 'Luke Shaw',
    position: 'DF',
    role: 'Overlapping Fullback',
    rating: 82,
    country: 'England',
    x: 18,
    y: 66,
  },
  {
    id: 'ugarte',
    name: 'Manuel Ugarte',
    position: 'MF',
    role: 'Ball Winning Anchor',
    rating: 81,
    country: 'Uruguay',
    x: 37,
    y: 49,
  },
  {
    id: 'mainoo',
    name: 'Kobbie Mainoo',
    position: 'MF',
    role: 'Box to Box Progressor',
    rating: 82,
    country: 'England',
    x: 63,
    y: 49,
  },
  {
    id: 'garnacho',
    name: 'A. Garnacho',
    position: 'FW',
    role: 'Inside Forward (Right)',
    rating: 81,
    country: 'Argentina',
    x: 82,
    y: 29,
  },
  {
    id: 'bruno',
    name: 'Bruno Fernandes',
    position: 'MF',
    role: 'Shadow Playmaker (C)',
    rating: 87,
    country: 'Portugal',
    x: 50,
    y: 31,
  },
  {
    id: 'rashford',
    name: 'Marcus Rashford',
    position: 'FW',
    role: 'Inside Forward (Left)',
    rating: 83,
    country: 'England',
    x: 18,
    y: 29,
  },
  {
    id: 'hojlund',
    name: 'Rasmus Højlund',
    position: 'FW',
    role: 'Pressing Target Forward',
    rating: 80,
    country: 'Denmark',
    x: 50,
    y: 11,
  }
];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'midfield',
    label: 'Deep Midfield Composure',
    query: 'I need more composure in the midfield to link deep build-up play and withstand aggressive opponent presses.',
    description: 'Find a calm, press-resistant deep playmaker who can organize build-up and link with Kobbie Mainoo.',
    icon: 'Activity'
  },
  {
    id: 'rightback',
    label: 'Elite Right-back Pace',
    query: 'We need a faster right-back to complement Leny Yoro and secure the right-side defensive transitions.',
    description: 'Find a recovery-pace right defending threat who has high overlaps and handles fast wingers.',
    icon: 'Shield'
  },
  {
    id: 'leftback',
    label: 'Dynamic Left-back Cover',
    query: 'Find a versatile left-back with high fitness consistency who can overlap, cross and provide defensive security.',
    description: 'Solve the Luke Shaw injury vulnerability with a reliable, highly creative left wing-back.',
    icon: 'Sparkles'
  },
  {
    id: 'striker',
    label: 'Clinical Main Goalscorer',
    query: 'We need a highly clinical centre-forward with physical holding-play capabilities to convert direct low-block chances.',
    description: 'Reinforce the front line with a clinical killer forward who will convert crosses on demand.',
    icon: 'Trophy'
  }
];
