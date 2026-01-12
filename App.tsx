import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { 
  Upload, Download, Wand2, Image as ImageIcon, Loader2, Music2, 
  RefreshCw, Volume2, Copy, FileText, Sparkles, Smile, Scissors, 
  Clapperboard, Calendar, MessageCircle, Send, Bot, MessageSquare, 
  TrendingUp, Gamepad2, Users, Palette, Layers, Smartphone, Type, 
  Briefcase, BookOpen, Mic2, Settings2, Globe, CheckCircle2, AlertTriangle, Zap, Info, Rocket, PenTool, Brush, ChevronRight, PlayCircle,
  ArrowRight, Hash, Clock, MousePointerClick, Target, Key, LogOut, Video, Phone, PhoneOff, ExternalLink, Newspaper, Mic, HelpCircle, X,
  User, Languages, Settings, Save, Trash2, Sliders, Github, FileQuestion, ChevronDown, ChevronUp, ChevronLeft
} from 'lucide-react';

import { 
  Tone, Persona, ScriptResponse, StoryboardItem, SeriesIdea, 
  CommentSim, TrendIdea, QuizIdea, PromoData, RepurposeData, BrandingData, ChatMessage, RealTimeTrend
} from './types';
import { extractJSON, base64ToArrayBuffer, encodeWAV, createBlob, decode, decodeAudioData } from './utils';

// --- Type Definitions for Window ---
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}

// --- Localization & Data ---

type Lang = 'id' | 'en';

const ICONS = {
  tones: {
    cheerful_female: <Sparkles size={18}/>,
    deep_male: <Mic2 size={18}/>,
    playful_kid: <Smile size={18}/>,
    storyteller: <BookOpen size={18}/>,
    professional: <Briefcase size={18}/>,
    custom: <Settings2 size={18}/>
  },
  goals: {
    views: <TrendingUp size={18}/>,
    sales: <MousePointerClick size={18}/>,
    engagement: <MessageCircle size={18}/>,
    custom: <PenTool size={18}/>
  }
};

const getLocalizedData = (lang: Lang) => {
  const isId = lang === 'id';
  return {
    tones: [
      { id: 'cheerful_female', label: isId ? 'Ceria' : 'Cheerful', icon: ICONS.tones.cheerful_female, voice: 'Kore', promptMod: isId ? 'Bahasa gaul, ceria, enerjik, khas TikTokers cewek.' : 'Slang, cheerful, energetic, typical female TikTok creator style.' },
      { id: 'deep_male', label: isId ? 'Berwibawa' : 'Authoritative', icon: ICONS.tones.deep_male, voice: 'Fenrir', promptMod: isId ? 'Formal, elegan, suara dalam, sangat meyakinkan.' : 'Formal, elegant, deep voice, very convincing.' },
      { id: 'playful_kid', label: isId ? 'Anak-anak' : 'Playful', icon: ICONS.tones.playful_kid, voice: 'Puck', promptMod: isId ? 'Bahasa sederhana, sangat antusias, riang gembira seperti anak kecil.' : 'Simple language, very enthusiastic, cheerful like a child.' },
      { id: 'storyteller', label: isId ? 'Storyteller' : 'Storyteller', icon: ICONS.tones.storyteller, voice: 'Orus', promptMod: isId ? 'Nada bercerita, sedikit misterius, membuat orang penasaran.' : 'Storytelling tone, slightly mysterious, making people curious.' },
      { id: 'professional', label: isId ? 'Profesional' : 'Professional', icon: ICONS.tones.professional, voice: 'Aoede', promptMod: isId ? 'Bahasa baku yang jelas, informatif, dan to the point.' : 'Clear formal language, informative, and to the point.' },
      { id: 'custom', label: 'Custom', icon: ICONS.tones.custom, voice: 'Kore', promptMod: isId ? 'Gaya bebas sesuai deskripsi pengguna.' : 'Custom style based on user description.' },
    ],
    goals: [
      { id: 'views', label: isId ? 'Kejar Views' : 'Get Views', icon: ICONS.goals.views, promptMod: isId ? 'Fokus pada hook yang kontroversial atau relatable, gunakan bahasa yang memancing orang menonton sampai habis. CTA: Ajak follow.' : 'Focus on controversial or relatable hooks, use language that keeps people watching. CTA: Ask to follow.' },
      { id: 'sales', label: isId ? 'Kejar Sales' : 'Get Sales', icon: ICONS.goals.sales, promptMod: isId ? 'Fokus pada urgensi, diskon terbatas, dan manfaat produk. Hard selling tapi tetap asik. CTA: Klik keranjang kuning.' : 'Focus on urgency, limited discounts, and product benefits. Hard selling but fun. CTA: Click the yellow basket/link.' },
      { id: 'engagement', label: isId ? 'Kejar Komen' : 'Get Comments', icon: ICONS.goals.engagement, promptMod: isId ? 'Akhiri dengan pertanyaan terbuka atau opini yang sedikit memancing perdebatan di kolom komentar. CTA: Ajak komen.' : 'End with an open question or opinion that sparks debate in comments. CTA: Ask to comment.' },
      { id: 'custom', label: 'Custom', icon: ICONS.goals.custom, promptMod: isId ? 'Sesuai instruksi spesifik pengguna.' : 'According to specific user instructions.' },
    ],
    personas: [
      { id: 'genz', label: isId ? 'Gen Z Julid' : 'Sassy Gen Z', icon: '😎', prompt: isId ? 'Kamu adalah Gen Z yang kritis, suka bahasa gaul (jujurly, valid, no debat), dan sangat peduli estetika. Bicara santai.' : 'You are a critical Gen Z, using internet slang (fr, no cap), caring about aesthetics. Speak casually.' },
      { id: 'emak', label: isId ? 'Emak Hemat' : 'Frugal Mom', icon: '🧕', prompt: isId ? 'Kamu adalah Ibu rumah tangga yang sangat perhitungan soal harga dan manfaat. Bicara ceplas-ceplos.' : 'You are a frugal housewife who calculates every penny and benefit. Speak bluntly.' },
      { id: 'investor', label: isId ? 'Investor' : 'Investor', icon: '💼', prompt: isId ? 'Kamu pebisnis sukses yang sibuk. Bicara to the point, menanyakan angka dan profit.' : 'You are a busy successful business person. Speak to the point, asking about numbers and profit.' },
      { id: 'custom', label: 'Custom', icon: '👤', prompt: isId ? 'Karakter bebas sesuai keinginan pengguna.' : 'Custom character as per user wish.' },
    ],
    ui: {
      splash: isId ? 'Memuat Creator Suite...' : 'Loading Creator Suite...',
      header_subtitle: 'TikTok Creator Suite',
      change_key: isId ? 'Ganti API Key' : 'Change API Key',
      setup_key: isId ? 'Setup API Key' : 'Setup API Key',
      enter_key: isId ? 'Masukkan Google Gemini API Key Anda.' : 'Enter your Google Gemini API Key.',
      start_btn: isId ? 'Mulai Berkarya' : 'Start Creating',
      upload_title: isId ? 'Upload Poster Iklan' : 'Upload Ad Poster',
      upload_desc: isId ? 'Upload poster promosi Anda, dan kami akan mengubahnya menjadi naskah video TikTok viral, strategi konten, dan audio AI dalam hitungan detik.' : 'Upload your promotional poster, and we will turn it into viral TikTok video scripts, content strategy, and AI audio in seconds.',
      powered_by: 'Powered by Gemini 2.5 Flash',
      video_goal: isId ? 'Tujuan Video' : 'Video Goal',
      voice_tone: isId ? 'Gaya Suara' : 'Voice Style',
      custom_goal_ph: isId ? 'Contoh: Edukasi, Undangan Event...' : 'E.g., Education, Event Invitation...',
      custom_tone_ph: isId ? 'Jelaskan gaya bicara...' : 'Describe speaking style...',
      poster_source: isId ? 'Poster Source' : 'Poster Source',
      reset: isId ? 'Reset' : 'Reset',
      context_label: isId ? 'Konteks Tambahan' : 'Additional Context',
      context_ph: isId ? 'Info tambahan: diskon 50%, khusus hari Jumat...' : 'Extra info: 50% discount, Friday only...',
      analyze_btn: isId ? 'ANALYZE & GENERATE' : 'ANALYZE & GENERATE',
      viral_potential: isId ? 'Potensi Viral' : 'Viral Potential',
      strength: isId ? 'Kekuatan' : 'Strength',
      improvement: isId ? 'Perbaikan' : 'Improvement',
      tabs: {
        script: isId ? 'Naskah' : 'Script',
        director: isId ? 'Sutradara' : 'Director',
        video: isId ? 'Magic Video' : 'Magic Video',
        trends: isId ? 'Radar Tren' : 'Trend Radar',
        branding: isId ? 'Branding' : 'Branding',
        planner: isId ? 'Strategi' : 'Strategy',
        promo: isId ? 'Promo' : 'Promo',
        repurpose: isId ? 'Repurpose' : 'Repurpose',
        market: isId ? 'Live Pitch' : 'Live Pitch'
      },
      processing: 'Processing...',
      make_viral: isId ? 'Buat Viral' : 'Make Viral',
      est_sec: isId ? 'Detik' : 'Sec',
      script_label: isId ? 'Naskah Video' : 'Video Script',
      gen_audio: isId ? 'Generate Audio' : 'Generate Audio',
      hooks: isId ? 'Killer Hooks' : 'Killer Hooks',
      hooks_waiting: isId ? 'Hooks akan muncul setelah analisis selesai.' : 'Hooks will appear after analysis.',
      caption_label: isId ? 'Caption & Hashtags' : 'Caption & Hashtags',
      copy_caption: isId ? 'Copy Full Caption' : 'Copy Full Caption',
      copied: isId ? 'Disalin!' : 'Copied!',
      empty_area: isId ? 'Area Kerja Kosong' : 'Empty Workspace',
      empty_desc: isId ? 'Upload poster di kiri untuk memulai magic' : 'Upload poster on the left to start magic',
      magic_video_title: isId ? 'Magic Video Generator' : 'Magic Video Generator',
      magic_video_desc: isId ? 'Ubah poster dan naskah kamu menjadi video teaser sinematik berdurasi pendek menggunakan model <b>Google Veo</b>.' : 'Transform your poster and script into a cinematic short video teaser using <b>Google Veo</b>.',
      veo_note: isId ? 'Fitur ini memerlukan API Key berbayar (GCP). Anda akan diminta memilih Project Key jika belum.' : 'This feature requires a paid API Key (GCP). You will be asked to select a Project Key if you haven\'t.',
      gen_video_btn: isId ? 'Generate Video (Veo)' : 'Generate Video (Veo)',
      download_mp4: isId ? 'Download MP4' : 'Download MP4',
      trends_title: isId ? 'Berita & Tren Terkini (Real-time)' : 'Real-time News & Trends',
      viral_format: isId ? 'Format Viral' : 'Viral Formats',
      connecting_search: isId ? 'Menghubungkan ke Google Search...' : 'Connecting to Google Search...',
      live_desc_ph: isId ? 'Deskripsikan karakter lawan bicara Anda (contoh: Klien yang sangat kritis)...' : 'Describe your partner character (e.g., A very critical client)...',
      end_call: isId ? 'Akhiri Call' : 'End Call',
      start_call: isId ? 'Mulai Live Call' : 'Start Live Call',
      listening: isId ? 'Mendengarkan...' : 'Listening...',
      start_chat_title: isId ? 'Mulai Percakapan' : 'Start Conversation',
      start_chat_desc: isId ? 'Chat atau Telepon sekarang.' : 'Chat or Call now.',
      type_msg: isId ? 'Ketik pesan...' : 'Type a message...',
      brand_palette: isId ? 'Palet Warna Brand' : 'Brand Color Palette',
      font_rec: isId ? 'Rekomendasi Font' : 'Font Recommendations',
      visual_mood: isId ? 'Mood Visual' : 'Visual Mood',
      edit_tips: isId ? 'Tips Editing' : 'Editing Tips',
      storyboard: isId ? 'Storyboard Produksi' : 'Production Storyboard',
      content_ideas: isId ? 'Ide Konten Lanjutan' : 'Series Content Ideas',
      netizen_sim: isId ? 'Simulasi Netizen' : 'Netizen Simulation',
      reply_suggestion: isId ? 'Saran Balas:' : 'Reply Suggestion:',
      target_inf: isId ? 'Target Influencer' : 'Target Influencer',
      thumbnail_concept: isId ? 'Konsep Thumbnail' : 'Thumbnail Concept',
      visualize_ai: isId ? 'Visualisasikan AI' : 'Visualize AI',
      main_text: isId ? 'Teks Utama' : 'Main Text',
      subject: isId ? 'Subjek' : 'Subject',
      background: 'Background',
      download: 'Download',
      ig_story: 'Instagram Story',
      x_thread: 'X Thread',
      linkedin: 'LinkedIn Post',
      copy_post: isId ? 'Copy Post' : 'Copy Post',
      variant: isId ? 'VARIAN' : 'VARIANT',
      error_quota: isId ? "Kuota API Habis atau Server Sibuk" : "API Quota Exceeded or Server Busy",
      error_key: isId ? "API Key Bermasalah" : "API Key Issue",
      error_billing: isId ? "Masalah Billing Google Cloud" : "Google Cloud Billing Issue",
      error_safety: isId ? "Konten Dibatasi oleh AI" : "Content Blocked by AI",
      error_parse: isId ? "AI Bingung (Format Data Error)" : "AI Confusion (Data Format Error)",
      error_network: isId ? "Koneksi Bermasalah" : "Connection Issue",
      error_default: isId ? "Terjadi Kesalahan Teknis" : "Technical Error Occurred",
      tips_label: isId ? "Solusi Praktis" : "Quick Tips",
      help: isId ? "Bantuan" : "Help",
      close_tips: isId ? "Tutup Tips" : "Close Tips",
      settings: isId ? "Pengaturan" : "Settings",
      creativity: isId ? "Kreativitas AI" : "AI Creativity",
      creativity_desc: isId ? "Rendah: Konsisten. Tinggi: Kreatif & Liar." : "Low: Consistent. High: Creative & Wild.",
      data_mgmt: isId ? "Manajemen Data" : "Data Management",
      clear_data: isId ? "Hapus Data & Reset" : "Clear Data & Reset",
      api_mgmt: isId ? "Manajemen API Key" : "API Key Management",
      update: isId ? "Simpan" : "Save",
      remove: isId ? "Hapus" : "Remove",
      about: "About",
      changelog: "What's New",
      faq: "Help Center",
      report: "Report Issue",
      version: "v.5.01 (TikTok Creator Suite)",
      about_desc: isId ? "Suite produksi AI khusus TikTok Creator. Ubah satu gambar menjadi naskah viral, video sinematik, dan strategi pemasaran. Platform lain coming soon." : "AI production suite optimized for TikTok Creators. Turn a single image into viral scripts, cinematic videos, and marketing strategies. Other platforms coming soon.",
      faq_items: [
         { q: isId ? "Mengapa Video Generation (Veo) gagal?" : "Why does Video Generation (Veo) fail?", a: isId ? "Veo memerlukan Google Cloud Project yang terhubung dengan akun Billing (Kartu Kredit). API Key gratisan tidak mendukung fitur ini." : "Veo requires a Google Cloud Project linked to a Billing account (Credit Card). Free tier API Keys do not support this feature." },
         { q: isId ? "Apakah data saya disimpan?" : "Is my data saved?", a: isId ? "Data disimpan secara lokal di browser Anda (LocalStorage). Kami tidak menyimpan gambar atau naskah Anda di server kami." : "Data is saved locally in your browser (LocalStorage). We do not store your images or scripts on our servers." },
         { q: isId ? "Kenapa Live Pitch tidak ada suara?" : "Why is there no audio in Live Pitch?", a: isId ? "Pastikan Anda memberikan izin mikrofon pada browser. Gunakan headset untuk hasil terbaik agar tidak terjadi feedback (gema)." : "Ensure you grant microphone permissions in the browser. Use a headset for best results to avoid feedback loops." },
         { q: isId ? "Apa itu error 429?" : "What is error 429?", a: isId ? "Itu berarti kuota API Key Anda habis atau rate limit tercapai. Tunggu 1-2 menit atau gunakan API Key berbayar." : "It means your API Key quota is exhausted or rate limit reached. Wait 1-2 minutes or use a paid API Key." }
      ],
      changelog_items: [
         { ver: "v.5.01", title: "TikTok Suite & Branding", desc: isId ? "Rebranding menjadi TikTok Creator Suite. Penyesuaian naskah untuk format vertikal." : "Rebranding to TikTok Creator Suite. Script adjustments for vertical format." },
         { ver: "v.0.05", title: "UX Polish & Settings", desc: isId ? "Menu Pengaturan, Pusat Bantuan, dan navigasi Carousel yang lebih rapi." : "Settings Menu, Help Center, and cleaner Carousel navigation." },
         { ver: "v.0.04", title: "Live API & Trends", desc: isId ? "Fitur Live Pitching real-time dan Radar Tren Google Search." : "Real-time Live Pitching and Google Search Trend Radar." },
         { ver: "v.0.03", title: "Magic Video (Veo)", desc: isId ? "Integrasi model Google Veo untuk generate video dari gambar." : "Google Veo model integration for image-to-video generation." },
      ]
    },
    prompts: {
      initial_sys: isId 
        ? `Analisis poster ini. Output dalam Bahasa Indonesia. Fokus untuk konten TikTok/Reels. Struktur JSON murni.` 
        : `Analyze this poster. Output in English. Focus on TikTok/Reels content. Pure JSON structure.`,
      initial_user: (context: string, goal: string, tone: string) => isId
        ? `${context}. TUJUAN: ${goal}. GAYA: ${tone}.
           JSON Keys: "script" (format TikTok pendek), "caption", "hashtag_clusters" (broad, niche, community), "viral_tips", "content_analysis" (viral_score 0-100, strength, improvement), "catchphrases", "hook_variations", "music_suggestions", "seo_keywords".`
        : `${context}. GOAL: ${goal}. TONE: ${tone}.
           JSON Keys: "script" (Short TikTok format), "caption", "hashtag_clusters" (broad, niche, community), "viral_tips", "content_analysis" (viral_score 0-100, strength, improvement), "catchphrases", "hook_variations", "music_suggestions", "seo_keywords".`,
      refine: (style: string, script: string) => isId
        ? `Tulis ulang naskah TikTok berikut menjadi gaya: ${style}. Output hanya teks naskah. Naskah: "${script}"`
        : `Rewrite the following TikTok script in style: ${style}. Output script text only. Script: "${script}"`,
      translate: (langName: string, script: string) => isId
        ? `Terjemahkan naskah ini ke ${langName}. Output hanya teks terjemahan. Naskah: "${script}"`
        : `Translate this script to ${langName}. Output translation text only. Script: "${script}"`,
      video: (caption: string, tone: string) => `Cinematic TikTok/Reels teaser for: ${caption.substring(0, 100)}. Style: ${tone}. Vertical 9:16 aspect ratio. High quality, 4k.`, 
      director: (script: string) => isId
        ? `Naskah: "${script}". Buat JSON storyboard (Bahasa Indonesia) untuk video vertikal 9:16: {"storyboard":[{"time":"0-3s","visual":"...","audio":"..."}],"hooks":["..."],"b_roll_prompts":["..."]}`
        : `Script: "${script}". Create JSON storyboard for vertical 9:16 video: {"storyboard":[{"time":"0-3s","visual":"...","audio":"..."}],"hooks":["..."],"b_roll_prompts":["..."]}`,
      planner: (script: string) => isId
        ? `Bertindak sebagai Content Strategist TikTok. Buat strategi konten berdasarkan naskah ini.
           Naskah: "${script}"
           Output Wajib JSON dengan struktur:
           {
             "series_ideas": [{"title": "Judul ide", "desc": "Deskripsi singkat"}],
             "comments_sim": [{"user": "Username", "comment": "Komentar netizen", "reply": "Saran balasan"}]
           }`
        : `Act as TikTok Content Strategist. Create content strategy based on this script.
           Script: "${script}"
           Output JSON strictly:
           {
             "series_ideas": [{"title": "Idea title", "desc": "Short description"}],
             "comments_sim": [{"user": "Username", "comment": "User comment", "reply": "Suggested reply"}]
           }`,
      promo: (script: string) => isId
        ? `Bertindak sebagai Marketing Expert. Buat materi promosi untuk naskah ini.
           Naskah: "${script}"
           Output Wajib JSON:
           {
             "influencers": [{"type": "Macro/Micro/Nano", "reason": "Alasan memilih", "dm_draft": "Draft DM kerjasama"}],
             "thumbnail": {"foreground": "Subjek utama gambar", "background": "Latar belakang", "text_overlay": "Teks di thumbnail (singkat)", "color_vibe": "Suasana warna"}
           }`
        : `Act as Marketing Expert. Create promo material for this script.
           Script: "${script}"
           Output JSON strictly:
           {
             "influencers": [{"type": "Macro/Micro/Nano", "reason": "Reason", "dm_draft": "DM Draft"}],
             "thumbnail": {"foreground": "Main subject", "background": "Background", "text_overlay": "Overlay text (short)", "color_vibe": "Color vibe"}
           }`,
      repurpose: (script: string) => isId
        ? `Bertindak sebagai Social Media Manager. Adaptasi naskah video ini ke format teks lain.
           Naskah: "${script}"
           Output Wajib JSON:
           {
             "ig_story": [{"frame": "1", "text": "Teks story", "visual": "Deskripsi visual"}],
             "twitter_thread": ["Tweet 1", "Tweet 2", "Tweet 3"],
             "linkedin_post": "Post profesional lengkap"
           }`
        : `Act as Social Media Manager. Repurpose this video script to text formats.
           Script: "${script}"
           Output JSON strictly:
           {
             "ig_story": [{"frame": "1", "text": "Story text", "visual": "Visual desc"}],
             "twitter_thread": ["Tweet 1", "Tweet 2", "Tweet 3"],
             "linkedin_post": "Professional post"
           }`,
      branding: isId
        ? `Analisis desain visual poster ini. Buatkan panduan branding TikTok (Bahasa Indonesia). JSON: { "colors": ["#HEX"], "fonts": [], "visual_mood": "...", "editing_tips": "..." }`
        : `Analyze visual design of this poster. Create TikTok branding guide. JSON: { "colors": ["#HEX"], "fonts": [], "visual_mood": "...", "editing_tips": "..." }`,
      trends: (script: string) => isId
        ? `Cari berita real-time dan topik trending TikTok/Google terkait naskah ini: "${script.substring(0, 200)}...". Return JSON with "real_time_trends" (title, url, source) and "trend_ideas" (title, desc) and "quiz_ideas".`
        : `Find real-time news and trending TikTok/Google topics related to this script content: "${script.substring(0, 200)}...". Return JSON with "real_time_trends" (title, url, source) and "trend_ideas" (title, desc) and "quiz_ideas".`,
      live_system: (persona: string) => isId
        ? `${persona} Sedang mengobrol santai membahas poster/iklan ini. Kritik atau puji secara langsung. Bahasa Indonesia.`
        : `${persona} Having a casual chat discussing this poster/ad. Critique or praise directly.`
    }
  };
};

// Helper: Duration Estimator
const estimateDuration = (text: any) => {
  if (!text || typeof text !== 'string') return 0;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / 2.5);
};

export default function App() {
  const [lang, setLang] = useState<Lang>('id');
  const d = getLocalizedData(lang);
  const t = d.ui;

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [tempKey, setTempKey] = useState('');
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // App States
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState('script');
  
  // Data States
  const [script, setScript] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtagClusters, setHashtagClusters] = useState<any>(null);
  const [viralTips, setViralTips] = useState<string[]>([]);
  const [storyboard, setStoryboard] = useState<StoryboardItem[]>([]);
  const [videoHooks, setVideoHooks] = useState<string[]>([]);
  const [bRollPrompts, setBRollPrompts] = useState<string[]>([]);
  const [seriesIdeas, setSeriesIdeas] = useState<SeriesIdea[]>([]);
  const [commentsSim, setCommentsSim] = useState<CommentSim[]>([]);
  const [trendIdeas, setTrendIdeas] = useState<TrendIdea[]>([]);
  const [realTimeTrends, setRealTimeTrends] = useState<RealTimeTrend[]>([]);
  const [quizIdeas, setQuizIdeas] = useState<QuizIdea[]>([]);
  const [promoData, setPromoData] = useState<PromoData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<ScriptResponse['content_analysis'] | null>(null);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [catchphrases, setCatchphrases] = useState<string[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [hookVariations, setHookVariations] = useState<string[]>([]);
  const [musicSuggestions, setMusicSuggestions] = useState<string[]>([]);
  const [repurposeData, setRepurposeData] = useState<RepurposeData | null>(null);
  const [brandingData, setBrandingData] = useState<BrandingData | null>(null);
  
  // Feature States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);

  // Interaction States
  const [selectedTone, setSelectedTone] = useState<Tone>(d.tones[0]);
  const [selectedGoal, setSelectedGoal] = useState(d.goals[0]);
  const [customGoalDesc, setCustomGoalDesc] = useState('');
  const [customToneDesc, setCustomToneDesc] = useState('');
  const [imageContext, setImageContext] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona>(d.personas[0]);
  const [customPersonaDesc, setCustomPersonaDesc] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showErrorGuide, setShowErrorGuide] = useState(false); 
  const [copied, setCopied] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingImageGen, setLoadingImageGen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Settings & Help State
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [creativity, setCreativity] = useState(0.7);

  // Carousel State
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const liveClientRef = useRef<any>(null); 
  const audioContextRef = useRef<{input: AudioContext, output: AudioContext} | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Update selections when language changes to preserve ID but update label
  useEffect(() => {
    const newTone = d.tones.find(t => t.id === selectedTone.id) || d.tones[0];
    const newGoal = d.goals.find(g => g.id === selectedGoal.id) || d.goals[0];
    const newPersona = d.personas.find(p => p.id === selectedPersona.id) || d.personas[0];
    setSelectedTone(newTone);
    setSelectedGoal(newGoal);
    setSelectedPersona(newPersona);
  }, [lang]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedWork = localStorage.getItem('asm_autosave');
    if (savedWork) {
        try {
            const parsed = JSON.parse(savedWork);
            if (parsed.script) setScript(parsed.script);
            if (parsed.caption) setCaption(parsed.caption);
            if (parsed.context) setImageContext(parsed.context);
        } catch (e) {
            console.error("Failed to load autosave", e);
        }
    }
  }, []);

  useEffect(() => {
    if (script || caption || imageContext) {
        const payload = { script, caption, context: imageContext };
        localStorage.setItem('asm_autosave', JSON.stringify(payload));
    }
  }, [script, caption, imageContext]);

  useEffect(() => {
    const checkKey = () => {
      if (process.env.API_KEY && process.env.API_KEY.length > 5) {
        setApiKey(process.env.API_KEY);
        setIsCheckingKey(false);
        return;
      }
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey && storedKey.length > 5) {
        setApiKey(storedKey);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  useEffect(() => {
      return () => {
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          if (thumbnailImage && thumbnailImage.startsWith('blob:')) URL.revokeObjectURL(thumbnailImage);
      }
  }, [audioUrl, videoUrl, thumbnailImage]);

  // Check scroll buttons visibility
  const checkScrollButtons = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [script, activeTab]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const amount = 300;
      tabsContainerRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const handleSaveKey = () => {
    if (tempKey.length < 10) {
      setError(lang === 'id' ? "API Key tidak valid." : "Invalid API Key");
      return;
    }
    localStorage.setItem('gemini_api_key', tempKey);
    setApiKey(tempKey);
    setError('');
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setTempKey('');
    setImage(null);
    setScript('');
  };

  const handleClearData = () => {
    localStorage.removeItem('asm_autosave');
    setScript(''); setCaption(''); setHashtagClusters(null); setViralTips([]); 
    setStoryboard([]); setVideoHooks([]); setBRollPrompts([]); setSeriesIdeas([]); 
    setCommentsSim([]); setTrendIdeas([]); setQuizIdeas([]); setPromoData(null); 
    setChatHistory([]); setImageContext('');
    setAiAnalysis(null); setCatchphrases([]); 
    setThumbnailImage(null); setHookVariations([]); setMusicSuggestions([]); 
    setSeoKeywords([]); setRepurposeData(null); setBrandingData(null); 
    setRealTimeTrends([]);
    setShowSettings(false);
  };

  useEffect(() => {
    if (error) setShowErrorGuide(false);
  }, [error]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatHistory, loadingMore]);

  const analyzeError = (errMsg: string) => {
    const lowerMsg = errMsg.toLowerCase();
    const e = d.ui;
    
    if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('exhausted')) {
      return { friendly: e.error_quota, desc: "Rate limit reached or quota exhausted.", tips: ["Wait 1-2 mins.", "Check billing."] };
    }
    if (lowerMsg.includes('400') || lowerMsg.includes('key') || lowerMsg.includes('permission') || lowerMsg.includes('403')) {
      return { friendly: e.error_key, desc: "Invalid API Key or permissions.", tips: ["Check API Key.", "Enable Billing for Veo."] };
    }
    if (lowerMsg.includes('billing') || lowerMsg.includes('project')) {
      return { friendly: e.error_billing, desc: "GCP Project Billing required.", tips: ["Enable Billing on GCP."] };
    }
    if (lowerMsg.includes('safety') || lowerMsg.includes('blocked') || lowerMsg.includes('harmful')) {
      return { friendly: e.error_safety, desc: "Content blocked by safety filters.", tips: ["Use safer image/prompt."] };
    }
    if (lowerMsg.includes('json') || lowerMsg.includes('parse')) {
      return { friendly: e.error_parse, desc: "Failed to parse AI response.", tips: ["Try again.", "Simplify context."] };
    }
    if (lowerMsg.includes('fetch') || lowerMsg.includes('network') || lowerMsg.includes('connection')) {
      return { friendly: e.error_network, desc: "Connection failed.", tips: ["Check internet."] };
    }
    return { friendly: e.error_default, desc: errMsg, tips: ["Refresh page.", "Check API Key."] };
  };

  const ErrorDisplay = () => {
    if (!error) return null;
    const info = analyzeError(error);

    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl overflow-hidden animate-in slide-in-from-top-2">
         <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
               <div className="p-2 bg-red-500/20 rounded-full mt-1"><AlertTriangle size={20} className="text-red-400" /></div>
               <div><h4 className="font-bold text-red-300 text-sm">{info.friendly}</h4><p className="text-xs text-red-200/70 mt-1 line-clamp-1">{info.desc}</p></div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowErrorGuide(!showErrorGuide)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold text-red-300 transition-colors flex items-center gap-1 whitespace-nowrap"><HelpCircle size={14}/> {showErrorGuide ? t.close_tips : t.help}</button>
                <button onClick={() => setError('')} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"><X size={16} /></button>
            </div>
         </div>
         {showErrorGuide && (
            <div className="bg-black/20 p-4 border-t border-red-500/10">
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Wand2 size={12}/> {t.tips_label}</p>
               <ul className="space-y-2">{info.tips.map((tip, i) => (<li key={i} className="flex items-start gap-2 text-xs text-slate-300"><CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" /><span>{tip}</span></li>))}</ul>
            </div>
         )}
      </div>
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        const result = reader.result as string;
        setImageBase64(result.split(',')[1]); 
        setScript(''); setCaption(''); setHashtagClusters(null); setViralTips([]); 
        setStoryboard([]); setVideoHooks([]); setBRollPrompts([]); setSeriesIdeas([]); 
        setCommentsSim([]); setTrendIdeas([]); setQuizIdeas([]); setPromoData(null); 
        setChatHistory([]); 
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null); 
        setAiAnalysis(null); setCatchphrases([]); 
        setThumbnailImage(null); setHookVariations([]); setMusicSuggestions([]); 
        setSeoKeywords([]); setRepurposeData(null); setBrandingData(null); 
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(null); 
        setRealTimeTrends([]);
        setImageContext(''); 
        setError(''); setActiveTab('script');
        localStorage.removeItem('asm_autosave');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateInitialContent = async () => {
    if (!imageBase64) return setError(t.upload_desc);
    setLoadingScript(true);
    setError('');

    const tonePrompt = selectedTone.id === 'custom' && customToneDesc ? customToneDesc : selectedTone.promptMod;
    const goalPrompt = selectedGoal.id === 'custom' && customGoalDesc ? customGoalDesc : selectedGoal.promptMod;
    const contextPrompt = imageContext ? `CONTEXT: ${imageContext}` : "";
    const userPrompt = d.prompts.initial_user(contextPrompt, goalPrompt, tonePrompt);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: [
          {
            parts: [
              { text: `${d.prompts.initial_sys}\n${userPrompt}` },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
            ]
          }
        ],
        config: { 
          responseMimeType: "application/json",
          temperature: creativity 
        }
      });

      const data = extractJSON<any>(response.text);
      if (data) {
        setScript(typeof data.script === 'string' ? data.script : "");
        let hashtagsText = "";
        if (data.hashtag_clusters) {
           setHashtagClusters(data.hashtag_clusters);
           const formatTags = (tags: string[] = []) => tags.map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`).join(' ');
           const broad = formatTags(data.hashtag_clusters.broad);
           const niche = formatTags(data.hashtag_clusters.niche);
           const community = formatTags(data.hashtag_clusters.community);
           hashtagsText = `${broad} ${niche} ${community}`.trim();
        }
        setCaption(`${data.caption || ""}\n\n${hashtagsText}`);
        setViralTips(data.viral_tips || []);
        setAiAnalysis(data.content_analysis || null);
        setCatchphrases(data.catchphrases || []);
        setHookVariations(data.hook_variations || []);
        setMusicSuggestions(data.music_suggestions || []);
        setSeoKeywords(data.seo_keywords || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingScript(false);
    }
  };

  const generateAudio = async () => {
    if (!script) return;
    setLoadingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedTone.voice } } }
        }
      });
      
      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        if (audioUrl) URL.revokeObjectURL(audioUrl); 
        const wav = encodeWAV(new Uint8Array(base64ToArrayBuffer(audioBase64)), 24000);
        setAudioUrl(URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAudio(false);
    }
  };

  const refineScriptWithAI = async (style: string) => {
    if (!script) return;
    setLoadingMore(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: [{ parts: [{ text: d.prompts.refine(style, script) }] }],
        config: { temperature: creativity }
      });
      if (response.text) {
          setScript(response.text.trim());
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(null); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const translateAndSpeak = async (langName: string, voice: string) => {
    if (!script) return;
    setLoadingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const transResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: [{ parts: [{ text: d.prompts.translate(langName, script) }] }],
        config: { temperature: 0.3 }
      });
      setScript(transResult.text?.trim() || "");
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: transResult.text || "" }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } }
        }
      });
      const audioBase64 = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          const wav = encodeWAV(new Uint8Array(base64ToArrayBuffer(audioBase64)), 24000);
          setAudioUrl(URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAudio(false);
    }
  };

  const generateThumbnailImage = async () => {
    if (!promoData) return;
    setLoadingImageGen(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `A professional TikTok video thumbnail. Subject: ${promoData.thumbnail?.foreground || 'Product'}. Background: ${promoData.thumbnail?.background || 'Clean studio'}. Vibe: ${promoData.thumbnail?.color_vibe || 'Vibrant'}. High resolution, 9:16 aspect ratio style.`;
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: '9:16' }
      });
      const b64 = response.generatedImages?.[0]?.image?.imageBytes;
      if (b64) {
          setThumbnailImage(`data:image/png;base64,${b64}`);
      } else {
          throw new Error("No image generated. Check API Key billing.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingImageGen(false);
    }
  };

  const generateVideo = async () => {
    if (!script) return;
    setLoadingVideo(true);
    setError('');
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) { await window.aistudio.openSelectKey(); }
      }
      const ai = new GoogleGenAI({ apiKey }); 
      const videoPrompt = d.prompts.video(caption, selectedTone.label);
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        image: { imageBytes: imageBase64!, mimeType: 'image/jpeg' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
          const res = await fetch(`${downloadLink}&key=${apiKey}`);
          const blob = await res.blob();
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          setVideoUrl(URL.createObjectURL(blob));
      } else {
          throw new Error("Gagal mendapatkan link video.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingVideo(false);
    }
  };

  const toggleLiveSession = async () => {
    if (isLiveConnected) {
       liveClientRef.current?.close();
       if (audioContextRef.current) {
         await audioContextRef.current.input.close();
         await audioContextRef.current.output.close();
         audioContextRef.current = null;
       }
       if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
       }
       setIsLiveConnected(false);
       setLiveVolume(0);
       return;
    }

    try {
       setIsLiveConnected(true);
       const ai = new GoogleGenAI({ apiKey });
       let nextStartTime = 0;
       
       const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
       const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
       audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };

       const outputNode = outputAudioContext.createGain();
       const sources = new Set<AudioBufferSourceNode>();
       
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       mediaStreamRef.current = stream;
       
       const personaPrompt = selectedPersona.id === 'custom' && customPersonaDesc
            ? `Persona: "${customPersonaDesc}".`
            : `${selectedPersona.prompt}.`;

       const sessionPromise = ai.live.connect({
         model: 'gemini-2.5-flash-native-audio-preview-12-2025',
         callbacks: {
           onopen: () => {
             const source = inputAudioContext.createMediaStreamSource(stream);
             const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
             scriptProcessor.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 let sum = 0;
                 for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                 setLiveVolume(Math.sqrt(sum/inputData.length) * 5);
                 const pcmBlob = createBlob(inputData);
                 sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
             };
             source.connect(scriptProcessor);
             scriptProcessor.connect(inputAudioContext.destination);
           },
           onmessage: async (message: LiveServerMessage) => {
             const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (base64Audio) {
               nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
               const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
               const source = outputAudioContext.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               outputNode.connect(outputAudioContext.destination);
               source.addEventListener('ended', () => sources.delete(source));
               source.start(nextStartTime);
               nextStartTime += audioBuffer.duration;
               sources.add(source);
             }
             if (message.serverContent?.interrupted) {
                sources.forEach(s => s.stop());
                sources.clear();
                nextStartTime = 0;
             }
           },
           onclose: () => { 
             setIsLiveConnected(false); 
             if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
           },
           onerror: (e: any) => { 
             console.error(e); 
             setIsLiveConnected(false);
             setError("Live Error: " + (e.message || "Connection failed"));
           }
         },
         config: {
           responseModalities: [Modality.AUDIO],
           speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedTone.voice } } },
           systemInstruction: d.prompts.live_system(personaPrompt)
         }
       });

       sessionPromise.then(session => { liveClientRef.current = session; });
    } catch (err: any) {
       setError(err.message);
       setIsLiveConnected(false);
    }
  };

  const handleTabTask = async (tab: string) => {
    setActiveTab(tab);
    if (tab === 'script' || !script || loadingMore) return;
    if (tab === 'video') return; 
    if (tab === 'director' && storyboard.length > 0) return;
    if (tab === 'planner' && seriesIdeas.length > 0) return;
    if (tab === 'trends' && realTimeTrends.length > 0) return; 
    if (tab === 'promo' && promoData) return;
    if (tab === 'repurpose' && repurposeData) return;
    if (tab === 'branding' && brandingData) return;

    setLoadingMore(true);
    setError('');
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = "";
      
      if (tab === 'trends') {
          const response = await ai.models.generateContent({
             model: 'gemini-3-pro-preview', 
             contents: d.prompts.trends(script),
             config: { 
               tools: [{googleSearch: {}}], 
               responseMimeType: "application/json",
               temperature: creativity
             }
          });
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const manualTrends: RealTimeTrend[] = chunks.filter((c: any) => c.web?.uri).map((c: any) => ({
                title: c.web?.title || "Trending Source",
                url: c.web?.uri,
                source: "Google Search"
            }));
          const textData = extractJSON<any>(response.text);
          setTrendIdeas(textData?.trend_ideas || []);
          setQuizIdeas(textData?.quiz_ideas || []);
          setRealTimeTrends([...manualTrends, ...(textData?.real_time_trends || [])]);
          setLoadingMore(false);
          return;
      }

      if (tab === 'director') prompt = d.prompts.director(script);
      if (tab === 'planner') prompt = d.prompts.planner(script);
      if (tab === 'promo') prompt = d.prompts.promo(script);
      if (tab === 'repurpose') prompt = d.prompts.repurpose(script);
      if (tab === 'branding') prompt = d.prompts.branding;

      const parts: any[] = [{ text: prompt }];
      if (tab === 'branding') parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64! } });

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: [{ parts: parts }],
        config: { 
          responseMimeType: "application/json",
          temperature: creativity
        }
      });
      const data = extractJSON<any>(result.text);
      if (!data) throw new Error("Gagal memproses respons AI. Coba lagi.");

      if (tab === 'director') { 
          setStoryboard(data.storyboard || []); setVideoHooks(data.hooks || []); setBRollPrompts(data.b_roll_prompts || []); 
      }
      if (tab === 'planner') { 
          const ideas = data.series_ideas || [];
          const comments = data.comments_sim || [];
          if (ideas.length === 0 && comments.length === 0) throw new Error(lang === 'id' ? "Gagal membuat strategi." : "Failed to generate strategy.");
          setSeriesIdeas(ideas); 
          setCommentsSim(comments); 
      }
      if (tab === 'promo') {
          if (!data.influencers && !data.thumbnail) throw new Error(lang === 'id' ? "Gagal membuat data promo." : "Failed to generate promo data.");
          setPromoData(data);
      }
      if (tab === 'repurpose') {
          if (!data.ig_story && !data.twitter_thread && !data.linkedin_post) throw new Error(lang === 'id' ? "Gagal membuat konten repurpose." : "Failed to generate repurpose content.");
          setRepurposeData(data);
      }
      if (tab === 'branding') setBrandingData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || loadingMore) return;
    const msg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setLoadingMore(true);
    try {
      const personaPrompt = selectedPersona.id === 'custom' && customPersonaDesc
        ? `Persona: ${customPersonaDesc}.`
        : `Persona: ${selectedPersona.label}. ${selectedPersona.prompt}.`;

      const contents = [
        { role: "user", parts: [
          { text: `${personaPrompt} Language: ${lang === 'id' ? 'Indonesian' : 'English'}` },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64! } }
        ]},
        ...chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: "user", parts: [{ text: msg }] }
      ];
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-09-2025',
        contents: contents,
        config: { temperature: creativity }
      });
      if (result.text) {
        setChatHistory(prev => [...prev, { role: 'model', text: result.text }]);
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Error: " + err.message }]);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasData = (id: string) => {
    if (id === 'script') return !!script;
    if (id === 'director') return storyboard.length > 0;
    if (id === 'planner') return seriesIdeas.length > 0;
    if (id === 'trends') return realTimeTrends.length > 0;
    if (id === 'promo') return !!promoData;
    if (id === 'repurpose') return !!repurposeData;
    if (id === 'branding') return !!brandingData;
    if (id === 'video') return !!videoUrl;
    return false;
  };

  const menuItems = [
    { id: 'script', label: t.tabs.script, icon: FileText },
    { id: 'director', label: t.tabs.director, icon: Clapperboard },
    { id: 'video', label: t.tabs.video, icon: Video },
    { id: 'trends', label: t.tabs.trends, icon: Newspaper },
    { id: 'branding', label: t.tabs.branding, icon: Brush },
    { id: 'planner', label: t.tabs.planner, icon: Calendar },
    { id: 'promo', label: t.tabs.promo, icon: Users },
    { id: 'repurpose', label: t.tabs.repurpose, icon: Layers },
    { id: 'market', label: t.tabs.market, icon: Mic2 },
  ];

  const SettingsModal = () => (
     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
           <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings size={20} className="text-indigo-400"/> {t.settings}</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
           </div>
           <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* API Key Section */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Key size={14}/> {t.api_mgmt}</h3>
                 <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex gap-2 mb-2">
                       <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder={apiKey ? "••••••••••••••••" : "AIzaSy..."} className="flex-1 bg-transparent border-b border-white/10 px-2 py-2 text-sm focus:border-indigo-500 outline-none text-white transition-all"/>
                       <button onClick={handleSaveKey} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all">{t.update}</button>
                    </div>
                    {apiKey && (
                       <button onClick={handleRemoveKey} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 mt-2 font-bold"><LogOut size={10}/> {t.remove} API Key</button>
                    )}
                 </div>
              </div>

              {/* Creativity Slider */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sliders size={14}/> {t.creativity}</h3>
                 <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex justify-between text-xs text-slate-300 font-bold"><span>Logis (0.0)</span><span>{creativity}</span><span>Liar (1.0)</span></div>
                    <input type="range" min="0" max="1" step="0.1" value={creativity} onChange={(e) => setCreativity(parseFloat(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                    <p className="text-[10px] text-slate-500 italic">{t.creativity_desc}</p>
                 </div>
              </div>

              {/* Data Management */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Trash2 size={14}/> {t.data_mgmt}</h3>
                 <button onClick={handleClearData} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"><Trash2 size={14}/> {t.clear_data}</button>
              </div>
           </div>
        </div>
     </div>
  );

  const HelpModal = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
         <div className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 flex-shrink-0">
               <h2 className="text-lg font-bold text-white flex items-center gap-2"><HelpCircle size={20} className="text-green-400"/> {t.help}</h2>
               <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
               
               {/* About Section */}
               <div className="text-center space-y-4 pb-6 border-b border-white/5">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto rotate-3"><Zap className="text-white w-8 h-8" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">AI Script Master</h3>
                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{t.version}</p>
                  </div>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">{t.about_desc}</p>
               </div>

               {/* What's New / Changelog */}
               <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Rocket size={14}/> {t.changelog}</h3>
                  <div className="space-y-3">
                     {t.changelog_items.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                           <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-1 rounded shadow">{item.ver}</span>
                           <div>
                              <h4 className="text-sm font-bold text-slate-200 mb-1">{item.title}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* FAQ Accordion */}
               <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileQuestion size={14}/> {t.faq}</h3>
                  <div className="space-y-2">
                     {t.faq_items.map((item, i) => (
                        <div key={i} className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                           <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)} className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors">
                              <span className="text-sm font-medium text-slate-300">{item.q}</span>
                              {openFAQ === i ? <ChevronUp size={16} className="text-indigo-400"/> : <ChevronDown size={16} className="text-slate-500"/>}
                           </button>
                           {openFAQ === i && (
                              <div className="px-4 pb-4 pt-0 text-xs text-slate-400 leading-relaxed animate-in slide-in-from-top-1">
                                 {item.a}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
               
               {/* Footer / Report */}
               <div className="pt-4 border-t border-white/5 flex justify-center">
                  <a href="https://github.com/yourusername/ai-script-master/issues" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-all border border-white/5">
                     <Github size={14}/> {t.report}
                  </a>
               </div>

            </div>
         </div>
      </div>
    );
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 animate-pulse duration-[3000ms]" />
         <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] mb-8 rotate-3 animate-bounce">
              <Zap className="text-white w-12 h-12" />
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-2xl">AI Script Master</h1>
           <p className="text-indigo-300 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">{t.splash}</p>
           <p className="text-slate-400 text-xs font-medium mt-2 opacity-80">TikTok Creator Suite v.5.01</p>
         </div>
      </div>
    );
  }

  if (!isCheckingKey && !apiKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div></div>
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-white/10 mx-auto shadow-xl"><Key className="text-indigo-400 w-8 h-8" /></div>
           <h1 className="text-2xl font-bold text-white text-center mb-2">{t.setup_key}</h1>
           <p className="text-slate-400 text-center text-sm mb-8">{t.enter_key}</p>
           <div className="space-y-4">
              <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="AIzaSy..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"/>
              <ErrorDisplay />
              <button onClick={handleSaveKey} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-600/20">{t.start_btn}</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 font-sans animate-in fade-in duration-1000">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 shadow-lg shadow-indigo-500/10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3"><Zap className="text-white w-6 h-6" /></div>
          <div><h1 className="text-xl font-bold tracking-tight text-white">AI Script Master</h1><p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">{t.header_subtitle}</p></div>
        </div>
        <div className="flex items-center gap-3">
            <div className="glass-panel p-1 rounded-full flex items-center">
                <button onClick={() => setLang('id')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${lang === 'id' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>ID</button>
                <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
            </div>
            <button onClick={() => setShowHelp(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all border border-white/5"><HelpCircle size={20} /></button>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all border border-white/5"><Settings size={20} /></button>
        </div>
      </header>

      {showSettings && <SettingsModal />}
      {showHelp && <HelpModal />}

      {!image ? (
        <div className="max-w-4xl mx-auto mt-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
           <div onClick={() => fileInputRef.current?.click()} className="glass-panel rounded-[2.5rem] p-12 cursor-pointer group hover:border-indigo-500/50 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500 border border-white/10 shadow-xl"><Upload className="text-indigo-400 group-hover:text-white w-10 h-10 transition-colors" /></div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">{t.upload_title}</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">{t.upload_desc}</p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"><Sparkles size={14} className="text-indigo-400" /> {t.powered_by}</div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
           </div>
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-3xl text-left">
                 <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={14} /> {t.video_goal}</h3>
                 <div className="space-y-3">
                   {d.goals.map(g => (
                     <button key={g.id} onClick={() => setSelectedGoal(g)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${selectedGoal.id === g.id ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-900/20' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'}`}>
                       <div className={`p-2 rounded-lg ${selectedGoal.id === g.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{g.icon}</div>
                       <span className="text-xs font-bold">{g.label}</span>
                       {selectedGoal.id === g.id && <CheckCircle2 size={14} className="ml-auto text-indigo-400"/>}
                     </button>
                   ))}
                   {selectedGoal.id === 'custom' && (
                     <input type="text" value={customGoalDesc} onChange={(e) => setCustomGoalDesc(e.target.value)} placeholder={t.custom_goal_ph} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-slate-600 transition-all animate-in slide-in-from-top-2"/>
                   )}
                 </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl text-left">
                 <h3 className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-4 flex items-center gap-2"><Music2 size={14} /> {t.voice_tone}</h3>
                 <div className="grid grid-cols-3 gap-3">{d.tones.map(t => (<button key={t.id} onClick={() => setSelectedTone(t)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${selectedTone.id === t.id ? 'bg-pink-600/20 border-pink-500/50 text-white shadow-lg shadow-pink-900/20' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'}`}><div className={`p-2 rounded-full ${selectedTone.id === t.id ? 'bg-pink-500 text-white' : 'bg-slate-800'}`}>{t.icon}</div><span className="text-[9px] font-bold uppercase truncate w-full text-center">{t.label}</span></button>))}</div>
                 {selectedTone.id === 'custom' && (<input type="text" value={customToneDesc} onChange={(e) => setCustomToneDesc(e.target.value)} placeholder={t.custom_tone_ph} className="mt-4 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-pink-500/50 outline-none text-white placeholder:text-slate-600 transition-all"/>)}
              </div>
           </div>
        </div>
      ) : (
        <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <h2 className="flex items-center gap-2 font-bold text-white text-sm"><ImageIcon size={16} className="text-indigo-400"/> {t.poster_source}</h2>
                 <button onClick={() => {setImage(null); setScript('')}} className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-all flex items-center gap-1"><RefreshCw size={10}/> {t.reset}</button>
              </div>
              <div className="aspect-[4/5] rounded-2xl bg-black/50 border border-white/10 overflow-hidden relative group-hover:border-indigo-500/30 transition-colors">
                <img src={image ? URL.createObjectURL(image) : ''} alt="Preview" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              </div>
              {!script && (
                <div className="mt-6 space-y-4 relative z-10">
                   <div className="p-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3"><PenTool size={14} className="text-indigo-400"/><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.context_label}</label></div>
                      <textarea value={imageContext} onChange={(e) => setImageContext(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm text-slate-300 focus:ring-0 outline-none resize-none h-16 placeholder={t.context_ph}"/>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 text-center"><div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">{selectedGoal.icon} {t.video_goal}</div><p className="text-xs text-white font-medium">{selectedGoal.label}</p></div>
                      <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 text-center"><div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1">{selectedTone.icon} {t.voice_tone}</div><p className="text-xs text-white font-medium">{selectedTone.label}</p></div>
                   </div>
                   <button onClick={generateInitialContent} disabled={loadingScript} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98]">{loadingScript ? <Loader2 className="animate-spin" /> : <><Rocket size={20} /> {t.analyze_btn}</>}</button>
                </div>
              )}
            </div>
            {aiAnalysis && (
               <div className="glass-panel rounded-3xl p-6 space-y-6 animate-in slide-in-from-left-4 duration-500 border-l-4 border-l-indigo-500">
                  <div className="flex items-end justify-between"><div><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.viral_potential}</h3><div className="text-4xl font-black text-white tracking-tighter">{aiAnalysis.viral_score}<span className="text-lg text-slate-500 font-medium ml-1">%</span></div></div><div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20"><TrendingUp size={20} className="text-white" /></div></div>
                  <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full" style={{width: `${aiAnalysis.viral_score}%`}}></div></div>
                  <div className="space-y-3 pt-2">
                     <div className="flex gap-3 text-xs items-start"><div className="mt-0.5 p-1 bg-green-500/10 rounded-full text-green-400"><CheckCircle2 size={12} /></div><p className="text-slate-300 leading-relaxed"><span className="text-white font-bold block mb-0.5">{t.strength}</span>{aiAnalysis.strength}</p></div>
                     <div className="flex gap-3 text-xs items-start"><div className="mt-0.5 p-1 bg-orange-500/10 rounded-full text-orange-400"><AlertTriangle size={12} /></div><p className="text-slate-300 leading-relaxed"><span className="text-white font-bold block mb-0.5">{t.improvement}</span>{aiAnalysis.improvement}</p></div>
                  </div>
               </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ErrorDisplay />
            
            <div className="relative group px-2 glass-panel rounded-2xl">
              {/* Left Arrow Button */}
              <button 
                  onClick={() => scrollTabs('left')}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-800/80 border border-white/10 text-white shadow-xl hover:bg-indigo-600 transition-all duration-300 transform -translate-x-1/2 ${canScrollLeft ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
              >
                  <ChevronLeft size={16} />
              </button>

              <div 
                ref={tabsContainerRef}
                onScroll={checkScrollButtons}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 relative"
              >
                {menuItems.map(tab => (
                  <button key={tab.id} onClick={() => handleTabTask(tab.id)} disabled={!script && tab.id !== 'script'} className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${!script && tab.id !== 'script' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <tab.icon size={16} className={activeTab === tab.id ? 'animate-pulse' : ''} /> {tab.label} {hasData(tab.id) && activeTab !== tab.id && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>}
                  </button>
                ))}
              </div>

              {/* Right Arrow Button */}
              <button 
                  onClick={() => scrollTabs('right')}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-800/80 border border-white/10 text-white shadow-xl hover:bg-indigo-600 transition-all duration-300 transform translate-x-1/2 ${canScrollRight ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
              >
                  <ChevronRight size={16} />
              </button>
            </div>

            <div className="glass-panel rounded-[2rem] p-8 min-h-[600px] relative overflow-hidden">
              {loadingMore && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 backdrop-blur-sm flex flex-col items-center justify-center">
                   <div className="bg-slate-900 p-4 rounded-full border border-white/10 shadow-2xl mb-4"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
                   <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase tracking-widest animate-pulse">{t.processing}</p>
                </div>
              )}

              {activeTab === 'script' && (script ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-wrap gap-3 pb-6 border-b border-white/5 justify-between items-center">
                       <div className="flex gap-2">
                          <button onClick={() => refineScriptWithAI(lang === 'id' ? "viral" : "viral")} className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex items-center gap-2"><Sparkles size={14}/> {t.make_viral}</button>
                          <button onClick={() => translateAndSpeak(lang === 'id' ? "English" : "Indonesian", lang === 'id' ? "Charon" : "Kore")} className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-2"><Globe size={14}/> {lang === 'id' ? 'EN' : 'ID'}</button>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/10"><Clock size={12} className="text-slate-400"/><span className="text-[10px] font-bold text-slate-300">Est. {estimateDuration(script)} {t.est_sec}</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2"><FileText size={14}/> {t.script_label}</label>
                        <div className="relative group"><textarea value={script} onChange={e => setScript(e.target.value)} className="w-full h-[400px] bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-sm leading-8 text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-mono shadow-inner"/></div>
                        <div className="flex gap-3 items-center pt-2">
                           <button onClick={generateAudio} disabled={loadingAudio} className="flex-grow py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-indigo-500/50 group">{loadingAudio ? <Loader2 className="animate-spin text-indigo-400" size={16}/> : <><Volume2 size={16} className="text-indigo-400 group-hover:scale-110 transition-transform"/> {t.gen_audio} ({selectedTone.label})</>}</button>
                        </div>
                        {audioUrl && (
                          <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
                             <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 animate-pulse"><PlayCircle className="text-white fill-white" size={20} /></div>
                             <audio src={audioUrl} controls className="h-8 w-full accent-indigo-500 opacity-80 hover:opacity-100 transition-opacity" />
                             <a href={audioUrl} download="ai_voice.wav" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"><Download size={16}/></a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-8">
                         <div className="space-y-4"><label className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2"><Zap size={14}/> {t.hooks}</label><div className="space-y-3">{hookVariations.length > 0 ? hookVariations.map((hook, i) => (<div key={i} onClick={() => setScript(`${hook} ${script}`)} className="group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-pink-500/50 cursor-pointer transition-all hover:bg-white/10 relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div><p className="text-[10px] text-pink-400 font-bold mb-1 opacity-70">{t.variant} {i+1}</p><p className="text-sm text-slate-200 line-clamp-2 font-medium">"{hook}"</p><ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" size={16} /></div>)) : <div className="text-xs text-slate-500 italic p-4 border border-dashed border-slate-700 rounded-xl text-center">{t.hooks_waiting}</div>}</div></div>
                         <div className="space-y-4"><label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2"><Hash size={14}/> {t.caption_label}</label><div className="relative"><textarea value={caption} onChange={e => setCaption(e.target.value)} className="w-full h-40 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"/></div><button onClick={() => { navigator.clipboard.writeText(caption); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all">{copied ? t.copied : <><Copy size={12}/> {t.copy_caption}</>}</button></div>
                      </div>
                    </div>
                  </div>
                ) : <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6 py-20 opacity-60"><div className="w-24 h-24 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center"><Wand2 size={40} className="text-slate-500" /></div><div className="text-center"><p className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-1">{t.empty_area}</p><p className="text-sm">{t.empty_desc}</p></div></div>
              )}

              {activeTab === 'video' && (
                  <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 space-y-8 py-10">
                      {!videoUrl ? (
                          <div className="text-center space-y-8 max-w-lg">
                              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 relative">
                                  {loadingVideo ? <Loader2 size={48} className="text-indigo-400 animate-spin"/> : <Video size={48} className="text-indigo-400" />}
                                  <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/10 -z-10"></div>
                              </div>
                              <div className="space-y-2">
                                  <h2 className="text-2xl font-black text-white">{t.magic_video_title}</h2>
                                  <p className="text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: t.magic_video_desc}}></p>
                              </div>
                              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-xs text-yellow-200 text-left">
                                  <span className="font-bold flex items-center gap-2 mb-1"><Info size={14}/> Note:</span>
                                  {t.veo_note}
                              </div>
                              <button onClick={generateVideo} disabled={loadingVideo} className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                  {loadingVideo ? 'Generating...' : <><Sparkles size={18} className="text-indigo-600"/> {t.gen_video_btn}</>}
                              </button>
                          </div>
                      ) : (
                          <div className="w-full max-w-md space-y-6">
                              <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                  <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                              </div>
                              <div className="flex gap-4">
                                  <a href={videoUrl} download="veo_magic_video.mp4" className="flex-1 py-4 bg-indigo-600 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all"><Download size={18}/> {t.download_mp4}</a>
                                  <button onClick={() => setVideoUrl(null)} className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><RefreshCw size={18}/></button>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'trends' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-6 rounded-3xl border border-blue-500/20">
                        <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-4"><Globe size={16}/> {t.trends_title}</h3>
                        {realTimeTrends.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {realTimeTrends.map((trend, i) => (
                                    <a key={i} href={trend.url} target="_blank" rel="noreferrer" className="glass-card p-4 rounded-xl flex gap-4 hover:bg-blue-500/10 transition-all group">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-400 font-bold text-xs">{i+1}</div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-slate-200 text-xs truncate mb-1">{trend.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500"><span>{trend.source}</span><ExternalLink size={10} /></div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : <div className="text-center py-8 text-slate-500 text-xs italic">{t.connecting_search}</div>}
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2 mb-6"><TrendingUp size={16}/> {t.viral_format}</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {trendIdeas.length > 0 ? trendIdeas.map((t, i) => (
                             <div key={i} className="glass-card p-6 rounded-3xl hover:border-orange-500/50 transition-all bg-gradient-to-br from-orange-500/5 to-transparent">
                                <h4 className="font-bold text-orange-200 text-sm mb-2">{t.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                             </div>
                          )) : <p className="text-xs text-slate-500 italic">Data belum tersedia.</p>}
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'market' && (
                 <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{minHeight: '500px'}}>
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {d.personas.map(p => (
                                    <button key={p.id} onClick={() => {setSelectedPersona(p); setChatHistory([])}} className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${selectedPersona.id === p.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-black/40 border-white/10 text-slate-400 hover:bg-white/5'}`}>
                                        <span className="text-lg">{p.icon}</span> {p.label}
                                    </button>
                                ))}
                            </div>
                            <button onClick={toggleLiveSession} className={`px-6 py-3 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-lg flex-shrink-0 ${isLiveConnected ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-green-500 hover:bg-green-600 text-black'}`}>
                                {isLiveConnected ? <><PhoneOff size={16}/> {t.end_call}</> : <><Phone size={16}/> {t.start_call}</>}
                            </button>
                        </div>
                        {selectedPersona.id === 'custom' && (
                             <input type="text" value={customPersonaDesc} onChange={(e) => setCustomPersonaDesc(e.target.value)} placeholder={t.live_desc_ph} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-slate-600 transition-all animate-in slide-in-from-top-2"/>
                        )}
                    </div>

                    {isLiveConnected ? (
                        <div className="flex-grow flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-40 h-40 rounded-full bg-indigo-500/20 flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                                    <div className="w-32 h-32 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-4xl shadow-2xl" style={{transform: `scale(${1 + liveVolume * 0.1})`, transition: 'transform 0.1s'}}>{selectedPersona.icon}</div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedPersona.label}</h3>
                                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest animate-pulse">{t.listening}</p>
                                <div className="mt-8 flex gap-1 h-8 items-end">{[...Array(5)].map((_,i) => (<div key={i} className="w-2 bg-indigo-500 rounded-full animate-[bounce_1s_infinite]" style={{height: `${Math.max(20, Math.random() * 100 * (liveVolume+0.5))}%`, animationDelay: `${i*0.1}s`}}></div>))}</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div ref={chatScrollRef} className="flex-grow bg-black/20 rounded-3xl border border-white/5 p-6 overflow-y-auto mb-4 space-y-6 shadow-inner">
                            {chatHistory.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                    <Bot size={64} className="mb-4 text-slate-700"/>
                                    <p className="text-sm font-bold uppercase tracking-widest">{t.start_chat_title}</p>
                                    <p className="text-xs">{t.start_chat_desc}</p>
                                </div>
                            )}
                            {chatHistory.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/5'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            </div>
                            <div className="flex gap-3">
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder={t.type_msg} className="flex-grow bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder:text-slate-600 transition-all"/>
                            <button onClick={handleChat} disabled={loadingMore} className="p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30"><Send size={20} className="text-white"/></button>
                            </div>
                        </>
                    )}
                 </div>
              )}

              {activeTab === 'branding' && brandingData && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                             <div className="glass-card p-6 rounded-3xl"><h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-6"><Palette size={16}/> {t.brand_palette}</h3><div className="grid grid-cols-4 gap-4">{brandingData.colors?.map((color, i) => (<div key={i} className="group cursor-pointer" onClick={() => navigator.clipboard.writeText(color)}><div className="h-20 w-full rounded-2xl shadow-xl border border-white/10 transition-transform group-hover:scale-105 relative flex items-center justify-center" style={{backgroundColor: color}}><Copy size={16} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" /></div><p className="text-[10px] text-center font-mono text-slate-400 mt-3 group-hover:text-indigo-400 transition-colors">{color}</p></div>))}</div></div>
                             <div className="glass-card p-6 rounded-3xl"><h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-4"><Type size={16}/> {t.font_rec}</h3><div className="space-y-3">{brandingData.fonts?.map((font, i) => (<div key={i} className="bg-[#0f1117]/50 p-4 rounded-xl border border-white/5 text-sm text-slate-200 flex items-center justify-between"><span>{font}</span><div className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400">Aa</div></div>))}</div></div>
                          </div>
                          <div className="space-y-6">
                             <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20"><h3 className="text-sm font-bold text-pink-400 mb-4 flex items-center gap-2"><Sparkles size={16}/> {t.visual_mood}</h3><p className="text-sm text-slate-300 leading-loose">{brandingData.visual_mood}</p></div>
                             <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20"><h3 className="text-sm font-bold text-teal-400 mb-4 flex items-center gap-2"><Scissors size={16}/> {t.edit_tips}</h3><p className="text-sm text-slate-300 leading-loose">{brandingData.editing_tips}</p></div>
                          </div>
                       </div>
                 </div>
              )}
              {activeTab === 'director' && storyboard.length > 0 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><Clapperboard size={16}/> {t.storyboard}</h3><div className="space-y-3">{storyboard.map((s, i) => (<div key={i} className="glass-card p-5 rounded-2xl flex gap-6 hover:bg-white/5 transition-colors group"><div className="w-20 pt-1 flex flex-col items-center gap-2 border-r border-white/10 pr-6"><div className="font-mono text-xs font-bold text-indigo-400">{s.time}</div><div className="w-1 h-full bg-indigo-500/20 rounded-full group-hover:bg-indigo-500 transition-colors"></div></div><div className="flex-1 space-y-3"><p className="text-sm font-medium text-white">{s.visual}</p><div className="bg-black/30 p-3 rounded-xl text-xs text-slate-400 flex items-center gap-3 border border-white/5"><Volume2 size={14} className="text-indigo-400 flex-shrink-0" /> <span className="italic">"{s.audio}"</span></div></div></div>))}</div></div>
              )}
              {activeTab === 'planner' && seriesIdeas.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4"><div className="space-y-4"><h3 className="text-sm font-bold text-pink-400 flex items-center gap-2"><Calendar size={16}/> {t.content_ideas}</h3>{seriesIdeas.map((idea, i) => (<div key={i} className="glass-card p-6 rounded-3xl hover:bg-white/5 transition-all group"><div className="flex items-center gap-3 mb-3"><div className="text-[10px] font-black text-white bg-pink-500 px-2 py-1 rounded-lg shadow-lg shadow-pink-500/30">PART {i+2}</div><h4 className="font-bold text-white text-sm group-hover:text-pink-300 transition-colors">{idea.title}</h4></div><p className="text-xs text-slate-400 leading-relaxed">{idea.desc}</p></div>))}</div><div className="space-y-4"><h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-4"><MessageCircle size={16}/> {t.netizen_sim}</h3>{commentsSim.map((c, i) => (<div key={i} className="space-y-3 relative pl-6 border-l border-white/10 pb-6 last:pb-0"><div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500"></div><div className="glass-card p-4 rounded-2xl rounded-tl-none bg-white/5"><div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div><p className="text-[10px] font-bold text-slate-300">{c.user || "User"}</p></div><p className="text-xs text-slate-400 italic mb-3">"{c.comment}"</p><div className="pl-3 py-2 border-l-2 border-blue-500/30 bg-blue-500/5 rounded-r-lg text-xs text-blue-200"><span className="font-bold block text-[10px] uppercase text-blue-400 mb-1">{t.reply_suggestion}</span> {c.reply}</div></div></div>))}</div></div>
              )}
              {activeTab === 'promo' && promoData && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4"><div><h3 className="text-sm font-bold text-teal-400 flex items-center gap-2"><Users size={16}/> {t.target_inf}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{promoData.influencers?.map((inf, i) => (<div key={i} className="glass-card p-6 rounded-3xl space-y-4 hover:bg-white/5 transition-all"><div className="flex justify-between items-center"><h4 className="font-bold text-white text-sm bg-teal-500/20 px-3 py-1 rounded-lg text-teal-300">{inf.type}</h4></div><p className="text-xs text-slate-300">{inf.reason}</p><div className="bg-black/30 p-4 rounded-xl text-[10px] text-slate-400 italic border border-white/5">"{inf.dm_draft}"</div></div>))}</div></div><div className="glass-card p-8 rounded-3xl bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-pink-500/20"><div className="flex justify-between items-center mb-8"><h3 className="text-sm font-bold text-pink-400 flex items-center gap-2"><Palette size={16}/> {t.thumbnail_concept}</h3><button onClick={generateThumbnailImage} disabled={loadingImageGen} className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-600/20">{loadingImageGen ? <Loader2 className="animate-spin" size={14}/> : <><Sparkles size={14}/> {t.visualize_ai}</>}</button></div><div className="flex flex-col md:flex-row gap-10"><div className="flex-1 space-y-5"><div className="bg-black/40 p-5 rounded-2xl border border-white/10"><p className="text-[10px] text-pink-400 font-bold uppercase mb-2">{t.main_text}</p><p className="text-2xl font-black text-white leading-tight">"{promoData.thumbnail?.text_overlay}"</p></div><div className="grid grid-cols-2 gap-4"><div className="bg-black/40 p-4 rounded-2xl border border-white/10"><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t.subject}</p><p className="text-xs text-slate-200">{promoData.thumbnail?.foreground}</p></div><div className="bg-black/40 p-4 rounded-2xl border border-white/10"><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t.background}</p><p className="text-xs text-slate-200">{promoData.thumbnail?.background}</p></div></div></div>{thumbnailImage && (<div className="w-full md:w-56 aspect-[9/16] rounded-2xl overflow-hidden relative group shadow-2xl border border-white/10"><img src={thumbnailImage} alt="AI Thumbnail" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" /><div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"><a href={thumbnailImage} download="thumbnail.png" className="px-4 py-2 bg-white text-black font-bold text-xs rounded-full flex items-center gap-2 hover:scale-105 transition-transform"><Download size={14}/> {t.download}</a></div></div>)}</div></div></div>
              )}
              {activeTab === 'repurpose' && repurposeData && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="glass-card p-6 rounded-3xl space-y-5 hover:border-purple-500/50 transition-all group"><h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 group-hover:text-purple-300"><Smartphone size={16}/> {t.ig_story}</h3><div className="space-y-4">{repurposeData.ig_story?.map((frame, i) => (<div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5 relative"><span className="absolute top-3 right-3 text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">FRAME {i+1}</span><p className="text-xs text-white mb-2 font-bold pr-16">"{frame.text}"</p><p className="text-[10px] text-slate-400 italic border-t border-white/5 pt-2 mt-2">{frame.visual}</p></div>))}</div></div><div className="glass-card p-6 rounded-3xl space-y-5 hover:border-blue-400/50 transition-all group"><h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 group-hover:text-blue-300"><Type size={16}/> {t.x_thread}</h3><div className="space-y-4 relative"><div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800"></div>{repurposeData.twitter_thread?.map((tweet, i) => (<div key={i} className="relative pl-10"><div className="absolute left-0 top-0 w-7 h-7 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 z-10">{i+1}</div><div className="bg-black/40 p-3 rounded-xl border border-white/5"><p className="text-xs text-slate-300 leading-relaxed mb-2">{tweet}</p><button onClick={() => navigator.clipboard.writeText(tweet)} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"><Copy size={10}/> Copy</button></div></div>))}</div></div><div className="glass-card p-6 rounded-3xl space-y-5 hover:border-blue-600/50 transition-all group"><h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 group-hover:text-blue-500"><Briefcase size={16}/> {t.linkedin}</h3><div className="bg-black/40 p-5 rounded-2xl border border-white/5 h-80 overflow-y-auto no-scrollbar shadow-inner"><p className="text-xs text-slate-300 leading-loose whitespace-pre-wrap">{repurposeData.linkedin_post}</p></div><button onClick={() => navigator.clipboard.writeText(repurposeData.linkedin_post || "")} className="w-full py-3 bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2 border border-blue-600/20"><Copy size={12}/> {t.copy_post}</button></div></div></div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}