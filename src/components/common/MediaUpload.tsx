import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Link as LinkIcon,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { parseVideoUrl } from './VideoPlayer';

interface MediaUploadProps {
  value?: string;
  onChange: (url: string) => void;
  type: 'image' | 'video' | 'both';
  category?: 'lessons' | 'summaries' | 'videos' | 'images' | 'general';
  label: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  helperText?: string;
  allowExternalUrl?: boolean;
}

export function MediaUpload({
  value = '',
  onChange,
  type,
  category = 'general',
  label,
  description,
  placeholder,
  helpText,
  helperText,
  allowExternalUrl = true,
}: MediaUploadProps) {
  const actualHelpText = helpText || helperText;
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState(value);
  const [uploadedInfo, setUploadedInfo] = useState<{ filename?: string; size?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMime =
    type === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
      : type === 'video'
      ? 'video/mp4,video/webm,video/ogg,video/quicktime'
      : 'image/*,video/*';

  const isVideo =
    type === 'video' ||
    value.endsWith('.mp4') ||
    value.endsWith('.webm') ||
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('/uploads/videos/');

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size (limit to 50MB for videos, 10MB for images in prototype)
    const maxBytes = type === 'video' || file.type.startsWith('video/') ? 60 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`حجم الملف كبير جداً (${(file.size / (1024 * 1024)).toFixed(1)} ميغابايت). الحد الأقصى هو ${maxBytes / (1024 * 1024)} ميغابايت.`);
      return;
    }

    setUploading(true);
    setProgress(15);

    try {
      // Read as DataURL for base64 upload
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 60);
          setProgress(percent);
        }
      };

      reader.onload = async () => {
        const base64Data = reader.result as string;
        setProgress(75);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-role': 'admin',
              'x-user-role': 'admin',
              'x-user-email': 'azc1744@gmail.com',
            },
            body: JSON.stringify({
              data: base64Data,
              filename: file.name,
              category,
              mimeType: file.type,
            }),
          });

          setProgress(100);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'فشل رفع الملف إلى الخادم');
          }

          const result = await res.json();
          if (result.success && result.url) {
            onChange(result.url);
            setCustomUrl(result.url);
            setUploadedInfo({ filename: file.name, size: result.size });
          } else {
            throw new Error('لم يتم استلام رابط الملف من الخادم');
          }
        } catch (postErr: any) {
          setError(postErr.message || 'حدث خطأ أثناء حفظ الملف على الخادم');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setError('تعذر قراءة محتوى الملف من جهازك');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setError(null);
    }
  };

  const handleClear = () => {
    onChange('');
    setCustomUrl('');
    setUploadedInfo(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 text-right" dir="rtl">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <label className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          {type === 'video' ? (
            <VideoIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{label}</span>
        </label>

        {allowExternalUrl && (
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[10px]">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                activeMode === 'upload'
                  ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              رفع ملف من الجهاز
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                activeMode === 'url'
                  ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              {type === 'video' ? 'رابط يوتيوب / خارجي' : 'رابط إنترنت مباشر'}
            </button>
          </div>
        )}
      </div>

      {description && <p className="text-[11px] text-stone-500 leading-normal">{description}</p>}

      {/* Main Upload / Input Area */}
      {activeMode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-stone-200 dark:border-stone-700 hover:border-emerald-400 bg-stone-50/50 dark:bg-stone-850/50'
          } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedMime}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {uploading ? (
            <div className="py-4 space-y-2">
              <Loader2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                جاري رفع الملف وحفظه على الخادم... ({progress}%)
              </p>
              <div className="w-48 mx-auto bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="py-3 space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                اضغط هنا لاختيار ملف من جهازك، أو اسحبه وأفلته هنا
              </p>
              <p className="text-[10px] text-stone-400">
                {type === 'image'
                  ? 'الصيغ المدعومة: PNG, JPG, JPEG, WebP, SVG, GIF (الحد الأقصى: 15 ميغابايت)'
                  : type === 'video'
                  ? 'الصيغ المدعومة: MP4, WebM, QuickTime (الحد الأقصى: 60 ميغابايت)'
                  : 'يدعم جميع صيغ الصور ومقاطع الفيديو'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={
                placeholder ||
                (type === 'video'
                  ? 'https://www.youtube.com/watch?v=... أو رابط فيديو مباشر'
                  : 'https://example.com/image.jpg أو رابط مباشر')
              }
              className="flex-1 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>تطبيق الرابط</span>
            </button>
          </div>
          <p className="text-[10px] text-stone-400">
            {type === 'video'
              ? 'يمكنك وضع رابط فيديو من YouTube مباشرة، وسيقوم النظام بتضمينه تلقائياً داخل المشغل.'
              : 'أدخل رابط الصورة المباشر من الإنترنت.'}
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Section if a value exists */}
      {value && (
        <div className="mt-2 p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>معاينة الملف المرفوع / المحدد:</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>حذف الملف المرفوع</span>
            </button>
          </div>

          {/* Media Preview Box */}
          <div className="rounded-xl overflow-hidden border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 max-h-56 flex items-center justify-center relative group">
            {isVideo ? (
              value.includes('youtube.com') || value.includes('youtu.be') ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={parseVideoUrl(value).embedUrl}
                    title="معاينة الفيديو"
                    className="w-full h-full border-0 rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={value}
                  controls
                  className="w-full max-h-52 object-contain bg-black rounded-xl"
                />
              )
            ) : (
              <img
                src={value}
                alt="معاينة الصورة"
                className="w-full max-h-52 object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <span className="truncate max-w-[280px] font-mono text-[10px] text-left" dir="ltr">
              {value}
            </span>
            {uploadedInfo?.size && (
              <span className="shrink-0 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-[10px]">
                الحجم: {uploadedInfo.size}
              </span>
            )}
          </div>
        </div>
      )}

      {actualHelpText && <p className="text-[10px] text-stone-400">{actualHelpText}</p>}
    </div>
  );
}
