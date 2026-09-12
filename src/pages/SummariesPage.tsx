import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Summary } from '../types/index';
import { VideoPlayer } from '../components/common/VideoPlayer';
import { MediaUpload } from '../components/common/MediaUpload';
import {
  FileText,
  Search,
  Lock,
  Heart,
  Eye,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Share2,
  Edit3,
  X,
  Image as ImageIcon,
  Video,
  Maximize2,
} from 'lucide-react';

export function SummariesPage() {
  const { subjects, currentUser, updateSummary, openPremiumModal, studentProgress, toggleFavorite, navigateTo, showToast } =
    useApp();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [isZoomImageOpen, setIsZoomImageOpen] = useState(false);

  // Admin edit states
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

  const handleOpenEditSummary = (s: Summary) => {
    setEditingSummary(s);
    setEditTitle(s.title);
    setEditSubjectId(s.subjectId);
    setEditExcerpt(s.excerpt || '');
    setEditPoints((s.keyPoints || []).join('\n'));
    setEditContent(s.content || s.fullSummary || '');
    setEditIsPremium(s.isPremium);
    setEditImageUrl(s.imageUrl || '');
    setEditVideoUrl(s.videoUrl || '');
  };

  const handleSaveEditSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSummary || !editTitle) return;
    const pts = editPoints
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const ok = await updateSummary(editingSummary.id, {
      title: editTitle,
      subjectId: editSubjectId,
      excerpt: editExcerpt,
      keyPoints: pts,
      content: editContent,
      fullSummary: editContent,
      isPremium: editIsPremium,
      imageUrl: editImageUrl,
      videoUrl: editVideoUrl,
    });

    if (ok) {
      const updatedObj: Summary = {
        ...editingSummary,
        title: editTitle,
        subjectId: editSubjectId,
        excerpt: editExcerpt,
        keyPoints: pts,
        content: editContent,
        fullSummary: editContent,
        isPremium: editIsPremium,
        imageUrl: editImageUrl,
        videoUrl: editVideoUrl,
      };
      setSummaries((prev) => prev.map((item) => (item.id === editingSummary.id ? updatedObj : item)));
      if (selectedSummary && selectedSummary.id === editingSummary.id) {
        setSelectedSummary(updatedObj);
      }
      setEditingSummary(null);
      showToast('تم حفظ وتحديث الملخص والوسائط بنجاح! 💾', 'success');
    }
  };

  useEffect(() => {
    async function loadSummaries() {
      setLoading(true);
      try {
        const res = await fetch('/api/summaries');
        if (res.ok) {
          const data = await res.json();
          setSummaries(data);
        }
      } catch (e) {
        console.error('Failed to load summaries:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSummaries();
  }, []);

  const isPremiumUser = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';

  const filtered = summaries.filter((sum) => {
    const matchesSubj = selectedSubjectId === 'all' || sum.subjectId === selectedSubjectId;
    const matchesQuery =
      sum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sum.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubj && matchesQuery;
  });

  return (
    <div id="summaries-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>مراجعة سريعة قبل الامتحانات</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          الملخصات والخرائط الذهنية
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          خلاصات مركزة تشمل القواعد النحوية، النماذج الديداكتيكية، والتعاريف البيداغوجية الأساسية.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedSubjectId === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            الكل ({summaries.length})
          </button>
          {subjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedSubjectId === subj.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {subj.title}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الملخصات..."
            className="w-full pl-4 pr-9 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Summaries Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">جاري تحميل الملخصات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <FileText className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">لا توجد ملخصات تطابق البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sum) => {
            const isFav = studentProgress.favoriteSummaries.includes(sum.id);
            const subj = subjects.find((s) => s.id === sum.subjectId);

            return (
              <div
                key={sum.id}
                className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {sum.imageUrl && (
                  <div
                    className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer group"
                    onClick={() => {
                      if (sum.isPremium && !isPremiumUser) {
                        openPremiumModal(`ملخص "${sum.title}" متاح حصرياً لمشتركي باقة Premium.`);
                      } else {
                        setSelectedSummary(sum);
                      }
                    }}
                  >
                    <img
                      src={sum.imageUrl}
                      alt={sum.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-emerald-400" />
                      <span>خريطة / صورة</span>
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {subj?.title || 'مقياس دراسي'}
                      </span>
                      {sum.videoUrl && (
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Video className="w-3 h-3" />
                          <span>فيديو</span>
                        </span>
                      )}
                    </div>
                    {sum.isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        مجاني
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                    {sum.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 line-clamp-2 leading-relaxed">
                    {sum.excerpt}
                  </p>

                  {/* Key points box */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-stone-500">عناصر الخلاصة:</p>
                    {sum.keyPoints.slice(0, 3).map((pt, i) => (
                      <p key={i} className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{pt}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite('summary', sum.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isFav
                            ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 text-rose-600'
                            : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-500'
                        }`}
                        title="حفظ في المفضلة"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      <span className="text-[11px] text-stone-400">{sum.downloadsCount} قراءة</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleOpenEditSummary(sum)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center gap-1 transition-colors"
                          title="تعديل محتوى هذا الملخص"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (sum.isPremium && !isPremiumUser) {
                            openPremiumModal(`ملخص "${sum.title}" متاح حصرياً لمشتركي باقة Premium.`);
                          } else {
                            setSelectedSummary(sum);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>قراءة الملخص</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-app Summary Reading Modal */}
      {selectedSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSummary(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 flex flex-col overflow-hidden text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ملخص مراجعة شامل</span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                  {selectedSummary.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSummary(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {/* Media Section in Reading Modal */}
              {(selectedSummary.imageUrl || selectedSummary.videoUrl) && (
                <div className="space-y-3 mb-2">
                  {selectedSummary.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 group">
                      <img
                        src={selectedSummary.imageUrl}
                        alt={selectedSummary.title}
                        className="w-full max-h-72 object-cover object-center group-hover:scale-[1.01] transition-transform cursor-pointer"
                        onClick={() => setIsZoomImageOpen(true)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                        <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>الخريطة الذهنية / مخطط الملخص</span>
                        </span>
                        <button
                          onClick={() => setIsZoomImageOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold flex items-center gap-1 transition-colors"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>تكبير</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedSummary.videoUrl && (
                    <VideoPlayer
                      url={selectedSummary.videoUrl}
                      title={`شرح مرئي: ${selectedSummary.title}`}
                    />
                  )}
                </div>
              )}

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
                {selectedSummary.excerpt}
              </div>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base pt-2">
                النقاط والمفاهيم الجوهرية:
              </h4>
              <ul className="space-y-2 pr-4 list-disc">
                {selectedSummary.keyPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base pt-2">
                الشرح المنهجي:
              </h4>
              <div className="whitespace-pre-line leading-relaxed text-stone-600 dark:text-stone-300">
                {selectedSummary.content}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    toggleFavorite('summary', selectedSummary.id);
                  }}
                  className="text-xs font-medium text-stone-500 hover:text-rose-500 flex items-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>حفظ في المفضلة</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      handleOpenEditSummary(selectedSummary);
                    }}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل هذا الملخص</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedSummary(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Summary Modal */}
      {editingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-600" />
                  <span>تعديل محتوى ملخص المراجعة</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  تعديل العنوان، المقياس، النقاط الرئيسية والشرح المفصل للملخص.
                </p>
              </div>
              <button
                onClick={() => setEditingSummary(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSummary} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">المقياس التابع له الملخص:</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">عنوان الملخص:</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsPremium}
                    onChange={(e) => setEditIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>ملخص حصري لأعضاء باقة Premium 🔒</span>
                </label>
              </div>

              <div>
                <label className="block font-bold mb-1">الوصف المختصر (Excerpt):</label>
                <textarea
                  rows={2}
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  placeholder="نبذة سريعة تصف هذا الملخص..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">النقاط الرئيسية (كل نقطة في سطر منفصل):</label>
                <textarea
                  rows={4}
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  placeholder="نقطة أولى جوهرية&#10;نقطة ثانية&#10;نقطة ثالثة"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">المحتوى الكامل والشرح المركز للملخص:</label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="اكتب هنا المحتوى الكامل للملخص والشرح التوضيحي..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Media Upload in Edit Summary Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
                <MediaUpload
                  label="صورة الملخص أو الخريطة الذهنية"
                  type="image"
                  category="summaries"
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  helperText="ارفع صورة خريطة ذهنية، مخطط تلخيصي، أو جدول قواعد"
                />

                <MediaUpload
                  label="فيديو الشرح المركز للملخص"
                  type="video"
                  category="videos"
                  value={editVideoUrl}
                  onChange={setEditVideoUrl}
                  helperText="ارفع فيديو مراجعة مركزة أو ضع رابط يوتيوب للملخص"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingSummary(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                >
                  حفظ وتحديث الملخص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Image Zoom Modal */}
      {isZoomImageOpen && selectedSummary?.imageUrl && (
        <div
          onClick={() => setIsZoomImageOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-800 text-white">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">{selectedSummary.title} - خريطة ذهنية</span>
              </div>
              <button
                onClick={() => setIsZoomImageOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/40 max-h-[80vh] overflow-auto">
              <img
                src={selectedSummary.imageUrl}
                alt={selectedSummary.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
