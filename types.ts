import { ReactNode } from 'react';

export interface Tone {
  id: string;
  label: string;
  icon: ReactNode;
  voice: string;
  promptMod: string;
}

export interface Persona {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export interface ContentAnalysis {
  viral_score: number;
  strength: string;
  improvement: string;
}

export interface StoryboardItem {
  time: string;
  visual: string;
  audio: string;
}

export interface SeriesIdea {
  title: string;
  desc: string;
}

export interface CommentSim {
  user: string;
  comment: string;
  reply: string;
}

export interface TrendIdea {
  title: string;
  desc: string;
}

export interface RealTimeTrend {
  title: string;
  url: string;
  source: string;
}

export interface QuizIdea {
  question: string;
  answer: string;
}

export interface InfluencerData {
  type: string;
  reason: string;
  dm_draft: string;
}

export interface ThumbnailData {
  foreground: string;
  background: string;
  text_overlay: string;
  color_vibe: string;
}

export interface PromoData {
  influencers: InfluencerData[];
  thumbnail: ThumbnailData;
}

export interface IGStoryFrame {
  text: string;
  visual: string;
}

export interface RepurposeData {
  ig_story: IGStoryFrame[];
  twitter_thread: string[];
  linkedin_post: string;
}

export interface BrandingData {
  colors: string[];
  fonts: string[];
  visual_mood: string;
  editing_tips: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ScriptResponse {
  script: string;
  caption: string;
  hashtags: string;
  viral_tips: string[];
  content_analysis: ContentAnalysis;
  catchphrases: string[];
  hook_variations: string[];
  music_suggestions: string[];
  seo_keywords: string[];
}