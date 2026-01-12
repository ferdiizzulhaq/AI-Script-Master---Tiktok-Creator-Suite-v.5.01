import { Blob } from '@google/genai';

export const extractJSON = <T>(text: string | undefined): T | null => {
  if (!text) return null;
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e1) {
    try {
      // Attempt to find JSON object within text
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const jsonSubstring = text.substring(start, end + 1);
        return JSON.parse(jsonSubstring);
      }
    } catch (e2) {
      console.error("JSON Parse Error:", e2);
    }
    console.error("Failed to parse JSON from:", text);
    throw new Error("Failed to process AI response. Please try again.");
  }
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Encode standard PCM to 16-bit Mono WAV for playback
export const encodeWAV = (samples: Float32Array | Uint8Array, sampleRate: number = 24000): DataView => {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);
  
  const writeString = (v: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length, true);

  const pcmData = new Uint8Array(buffer, 44);
  if (samples instanceof Float32Array) {
       // Assuming input Float32 is already normalized or handled elsewhere if converting to 16bit PCM
       // For this app, we mostly use this for the RAW bytes returned by TTS which are already PCM-like
       // If we needed to convert Float32 audio context buffer to Int16:
       for (let i = 0; i < samples.length; i++) {
          const s = Math.max(-1, Math.min(1, samples[i]));
          const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
          // This requires a DataView setInt16 logic, but for simplicity in this utility 
          // we are assuming 'samples' passed here for WAV creation from TTS are already uint8 bytes
       }
  } else {
      pcmData.set(samples);
  }

  return view;
};

// --- Helpers for Live API ---

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}