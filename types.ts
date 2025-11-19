export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Deep, resonant, and authoritative' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Calm, steady, and trustworthy' },
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Warm, clear, and engaging' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Energetic, enthusiastic, and fast' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Soft, gentle, and soothing' },
];

export interface AudioState {
  base64Data: string | null;
  isPlaying: boolean;
  error: string | null;
}