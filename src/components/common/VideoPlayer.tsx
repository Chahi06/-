import React, { useState } from 'react';
import { Play, Video, ExternalLink, Maximize2, CheckCircle2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  duration?: string;
  className?: string;
  autoPlay?: boolean;
}

export function parseVideoUrl(url: string) {
  if (!url) return { type: 'unknown', src: '' };

  const cleanUrl = url.trim();

  // YouTube matchers
  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      src: cleanUrl,
    };
  }

  // Vimeo matchers
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      src: cleanUrl,
    };
  }

  // Direct MP4 / WebM or local uploaded path
  if (
    cleanUrl.startsWith('/uploads/') ||
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.includes('blob:') ||
    cleanUrl.includes('data:video')
  ) {
    return {
      type: 'direct',
      src: cleanUrl,
    };
  }

  // Fallback as iframe or direct
  return {
    type: 'generic',
    src: cleanUrl,
  };
}

export function VideoPlayer({ url, title, duration, className = '' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoInfo = parseVideoUrl(url);

  if (!url) return null;

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-md ${className}`}
      dir="rtl"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/80 border-b border-stone-800 text-xs text-stone-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>{title || 'شرح المحاضرة المرئية'}</span>
          </span>
        </div>
        {duration && (
          <span className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md font-mono">
            {duration}
          </span>
        )}
      </div>

      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        {videoInfo.type === 'youtube' && videoInfo.embedUrl ? (
          <iframe
            src={videoInfo.embedUrl}
            title={title || 'فيديو الدرس'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : videoInfo.type === 'vimeo' && videoInfo.embedUrl ? (
          <iframe
            src={videoInfo.embedUrl}
            title={title || 'فيديو الدرس'}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoInfo.src}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            متصفحك لا يدعم تشغيل مقاطع الفيديو مباشرة.
          </video>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-stone-950/90 text-[11px] text-stone-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>محاضرة تدريبية مسجلة وموثقة</span>
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium"
        >
          <span>فتح الرابط في نافذة جديدة</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
