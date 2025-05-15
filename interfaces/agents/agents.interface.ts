export interface FormData {
  name: string;
  welcomeMessage: string;
  prompt: string;
  tone: string;
  voice: string;
}

export interface Voice {
  voice_id: string;
  voice_name: string;
  preview_audio_url: string;
}

export interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}
