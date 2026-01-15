
export type InputMode = 'text' | 'upload' | 'record';

export interface MinutesResult {
  content: string;
  timestamp: string;
  type: 'standard' | 'followup' | 'whatsapp' | 'actionItems' | 'attendance';
}

export interface AppState {
  inputMode: InputMode;
  inputText: string;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isGenerating: boolean;
  isRecording: boolean;
  result: MinutesResult | null;
  error: string | null;
}
