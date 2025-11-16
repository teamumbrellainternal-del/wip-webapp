/**
 * Creative Profile Constants
 * Allowed values for onboarding step 3 tag selection
 * Source: docs/initial-spec/eng-spec.md - Screen 7 (Onboarding Step 3)
 */

/**
 * Artist Types - What type of artist are you?
 */
export const ARTIST_TYPES = [
  'solo',
  'band',
  'duo',
  'trio',
  'dj',
  'producer',
  'songwriter',
  'vocalist',
  'session-musician',
  'multi-instrumentalist',
] as const

/**
 * DAWs (Digital Audio Workstations)
 */
export const DAWS = [
  'Ableton Live',
  'Logic Pro',
  'Pro Tools',
  'FL Studio',
  'Cubase',
  'Studio One',
  'Reaper',
  'GarageBand',
  'Reason',
  'Bitwig',
  'Cakewalk',
  'Audacity',
  'Other',
] as const

/**
 * Music/Social Platforms
 */
export const PLATFORMS = [
  'Spotify',
  'Apple Music',
  'SoundCloud',
  'Bandcamp',
  'YouTube',
  'YouTube Music',
  'TikTok',
  'Instagram',
  'Facebook',
  'Twitter/X',
  'Twitch',
  'Mixcloud',
  'Beatport',
  'Tidal',
  'Amazon Music',
  'Other',
] as const

/**
 * Music Subscriptions & Services
 */
export const SUBSCRIPTIONS = [
  'Spotify Premium',
  'Apple Music',
  'Splice',
  'Sounds.com',
  'LANDR',
  'DistroKid',
  'CD Baby',
  'TuneCore',
  'Amuse',
  'Ditto Music',
  'iZotope',
  'Native Instruments',
  'Waves',
  'Plugin Boutique',
  'Slate Digital',
  'Universal Audio',
  'Soundtrap',
  'BandLab',
  'None',
  'Other',
] as const

/**
 * Common Equipment Categories
 */
export const EQUIPMENT = [
  // Audio Interfaces
  'Audio Interface',
  'Focusrite Scarlett',
  'Universal Audio Apollo',
  'PreSonus AudioBox',
  'MOTU',

  // Microphones
  'Condenser Microphone',
  'Dynamic Microphone',
  'USB Microphone',
  'Shure SM7B',
  'Rode NT1',
  'Blue Yeti',

  // Monitors & Headphones
  'Studio Monitors',
  'KRK Rokit',
  'Yamaha HS Series',
  'JBL Studio Monitors',
  'Studio Headphones',
  'Audio-Technica',
  'Beyerdynamic',
  'Sennheiser',

  // Controllers
  'MIDI Controller',
  'MIDI Keyboard',
  'Drum Pad Controller',
  'Akai MPC',
  'Native Instruments Maschine',
  'Ableton Push',

  // Instruments
  'Electric Guitar',
  'Acoustic Guitar',
  'Bass Guitar',
  'Synthesizer',
  'Piano/Keyboard',
  'Drum Kit',
  'DJ Controller',
  'Turntables',

  // Other
  'Mixing Console',
  'Preamp',
  'Compressor',
  'EQ',
  'Other',
] as const

/**
 * Common Struggles for Musicians
 */
export const STRUGGLES = [
  'Finding gigs',
  'Marketing myself',
  'Social media presence',
  'Building a fanbase',
  'Getting discovered',
  'Networking',
  'Pricing my services',
  'Contract negotiations',
  'Time management',
  'Creative block',
  'Finding collaborators',
  'Music production quality',
  'Mixing and mastering',
  'Studio access',
  'Equipment costs',
  'Understanding royalties',
  'Distribution',
  'Getting radio play',
  'Getting press coverage',
  'Managing finances',
  'Work-life balance',
  'Imposter syndrome',
  'Staying motivated',
  'None',
  'Other',
] as const

/**
 * Type exports for TypeScript
 */
export type ArtistType = typeof ARTIST_TYPES[number]
export type DAW = typeof DAWS[number]
export type Platform = typeof PLATFORMS[number]
export type Subscription = typeof SUBSCRIPTIONS[number]
export type Equipment = typeof EQUIPMENT[number]
export type Struggle = typeof STRUGGLES[number]

/**
 * Check if a value is a valid artist type
 */
export function isValidArtistType(value: string): value is ArtistType {
  return ARTIST_TYPES.includes(value as ArtistType)
}

/**
 * Check if a value is a valid DAW
 */
export function isValidDAW(value: string): value is DAW {
  return DAWS.includes(value as DAW)
}

/**
 * Check if a value is a valid platform
 */
export function isValidPlatform(value: string): value is Platform {
  return PLATFORMS.includes(value as Platform)
}

/**
 * Check if a value is a valid subscription
 */
export function isValidSubscription(value: string): value is Subscription {
  return SUBSCRIPTIONS.includes(value as Subscription)
}

/**
 * Check if a value is a valid equipment item
 */
export function isValidEquipment(value: string): value is Equipment {
  return EQUIPMENT.includes(value as Equipment)
}

/**
 * Check if a value is a valid struggle
 */
export function isValidStruggle(value: string): value is Struggle {
  return STRUGGLES.includes(value as Struggle)
}
