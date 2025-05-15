export interface DrewVoiceAccent {
  personal_drew_id: string;
  outbound_drew_id: string;
}

// types.ts
export interface Tone {
  name:
    | 'professional'
    | 'sales-driven'
    | 'friendly-conversational'
    | 'supportive-empathetic'
    | 'energetic-enthusiastic'
    | 'direct-no-nonsense'
    | 'humorous-playful';
  description: string;
}

export interface Agent {
  id: number;
  user_id: number;
  name: string;
  voiceId: string;
  welcomeMessage: string;
  prompt: string;
  tone: Tone;
  created_at: Date;
  updated_at: Date;
}
