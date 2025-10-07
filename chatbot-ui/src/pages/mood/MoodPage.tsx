import React, { useEffect, useMemo, useState } from 'react';
import { fetchRandomQuote, getDailyMoodHistoryAPI, saveDailyMoodAPI, getTodayMoodAPI } from '@/services/yourApiFunctions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type MoodKey = 'happy' | 'fear' | 'sad' | 'angry';

interface DayMood {
  date: string; // YYYY-MM-DD
  happy: number;
  fear: number;
  sad: number;
  angry: number;
}

// Fallback todos if package not available
const FALLBACK_TODOS = [
  'Viết 3 điều biết ơn hôm nay',
  'Đi bộ 10-15 phút hít thở sâu',
  'Gọi/nhắn tin cho một người bạn',
  'Uống 1 ly nước ấm và thư giãn 5 phút',
  'Nghe 1 bài nhạc tích cực',
  'Dọn dẹp góc nhỏ bàn học/bàn làm việc',
  'Thực hành 5 phút hít thở 4-7-8',
  'Viết ra một mục tiêu nhỏ cho ngày mai',
  'Cười một cái thiệt tươi (đứng trước gương cũng được!)',
  'Giãn cơ/duỗi người 3-5 phút'
];

function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

function generateMockData(): DayMood[] {
  const days = getLast7Days();
  return days.map((date) => ({
    date,
    happy: Math.floor(Math.random() * 5),
    fear: Math.floor(Math.random() * 5),
    sad: Math.floor(Math.random() * 5),
    angry: Math.floor(Math.random() * 3),
  }));
}

function EmotionLinesChart({ data }: { data: DayMood[] }) {
  // Inside Out-inspired colors
  const EMOTION_COLOR: Record<MoodKey, string> = {
    happy: '#f59e0b',   // Joy - amber
    fear: '#8b5cf6',    // Fear - purple
    sad: '#3b82f6',     // Sadness - blue
    angry: '#ef4444',   // Anger - red
  };

  // Prepare series per emotion as percentages (0..1)
  const series = useMemo(() => {
    return ['happy', 'fear', 'sad', 'angry'].map((k => k as MoodKey)).map((key) => {
      return data.map((d) => {
        const total = d.happy + d.fear + d.sad + d.angry || 1;
        return (d[key] / total);
      });
    });
  }, [data]);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const height = 260;
  const padding = 36;
  const count = data.length;
  const width = Math.max(320, containerWidth || 320);
  const step = (width - padding * 2) / Math.max(count - 1, 1);

  const yFor = (v: number) => height - padding - v * (height - padding * 2);

  function buildPath(values: number[]) {
    if (values.length === 0) return '';
    let path = `M ${padding} ${yFor(values[0])}`;
    for (let i = 1; i < values.length; i++) {
      const x = padding + i * step;
      const prevX = padding + (i - 1) * step;
      const cx = (prevX + x) / 2;
      const y1 = yFor(values[i - 1]);
      const y2 = yFor(values[i]);
      path += ` C ${cx} ${y1}, ${cx} ${y2}, ${x} ${y2}`;
    }
    return path;
  }

  const paths = useMemo(() => {
    return series.map((values) => buildPath(values));
  }, [series, step, height]);

  // Hover interactions
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const handleMove = (evt: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const bounds = (evt.currentTarget.parentNode as SVGSVGElement).getBoundingClientRect();
    const x = evt.clientX - bounds.left;
    const rel = Math.max(0, Math.min(1, (x - padding) / Math.max(1, (width - padding * 2))));
    const idx = Math.round(rel * (count - 1));
    setHoverIdx(idx);
  };
  const handleLeave = () => setHoverIdx(null);

  React.useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setContainerWidth(w);
      }
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <svg width={width} height={height} className="rounded-xl border border-white/30 bg-gradient-to-br from-indigo-50 via-white to-rose-50 shadow-sm">
        {/* Grid and axes */}
        <g stroke="#e5e7eb">
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i}>
              <line x1={padding} x2={width - padding} y1={padding + i * ((height - padding * 2) / 4)} y2={padding + i * ((height - padding * 2) / 4)} strokeWidth={0.5} />
              <text x={8} y={padding + i * ((height - padding * 2) / 4) + 4} fontSize={10} fill="#94a3b8">{100 - i * 25}%</text>
            </g>
          ))}
        </g>

        {/* Lines per emotion */}
        {paths.map((dStr, i) => {
          const key = (['happy','fear','sad','angry'][i]) as MoodKey;
          return <path key={key} d={dStr} fill="none" stroke={EMOTION_COLOR[key]} strokeWidth={3} strokeLinecap="round" />
        })}

        {/* X-axis ticks */}
        {data.map((d, i) => (
          <g key={d.date}>
            <line x1={padding + i * step} x2={padding + i * step} y1={height - padding} y2={height - padding + 6} stroke="#cbd5e1" />
            <text x={padding + i * step} y={height - padding + 18} textAnchor="middle" fontSize={10} fill="#64748b">{d.date.slice(5)}</text>
          </g>
        ))}

        {/* Hover guide */}
        {hoverIdx !== null && (
          <line x1={padding + hoverIdx * step} x2={padding + hoverIdx * step} y1={padding} y2={height - padding} stroke="#94a3b8" strokeDasharray="4 4" />
        )}

        {/* Hover capture */}
        <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill="transparent" onMouseMove={handleMove} onMouseLeave={handleLeave} />
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div className="absolute -translate-x-1/2" style={{ left: `${(padding + hoverIdx * step) / width * 100}%`, top: 8 }}>
          <div className="rounded-lg bg-white shadow-md border border-gray-200 px-3 py-2 text-xs text-gray-800">
            <div className="font-semibold mb-1">{data[hoverIdx].date}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background:'#f59e0b'}}></span>Vui: {data[hoverIdx].happy}</div>
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background:'#8b5cf6'}}></span>Sợ hãi: {data[hoverIdx].fear}</div>
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background:'#3b82f6'}}></span>Buồn: {data[hoverIdx].sad}</div>
              <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background:'#ef4444'}}></span>Tức giận: {data[hoverIdx].angry}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MoodPage() {
  const [quote, setQuote] = useState<{ content: string; author: string } | null>(null);
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [data, setData] = useState<DayMood[]>(generateMockData());
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [todayMood, setTodayMood] = useState<MoodKey | null>(null);
  const [isLoadingMood, setIsLoadingMood] = useState(false);
  const navigate = useNavigate();
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifLoading, setGifLoading] = useState<boolean>(false);
  const GIPHY_KEY = (import.meta as any).env?.VITE_GIPHY_API_KEY || 'x0nSdVDeX8AP55370oqM94zweBNenVQF';

  useEffect(() => {
    // Load mood history from API
    (async () => {
      try {
        const moodHistory = await getDailyMoodHistoryAPI(7);
        setData(moodHistory);
      } catch (error) {
        console.error('Error loading mood history:', error);
        toast.error('Không thể tải lịch sử cảm xúc');
      }
    })();

    // Load today's mood
    (async () => {
      try {
        const result = await getTodayMoodAPI();
        if (result.data && result.data.emotion) {
          setTodayMood(result.data.emotion as MoodKey);
          setSelectedMood(result.data.emotion as MoodKey);
        }
      } catch (error) {
        console.error('Error loading today mood:', error);
      }
    })();

    (async () => {
      // Quote: try inspirational-quotes; fallback to backend quotes list
      try {
        const mod: any = await import('inspirational-quotes');
        const getQ = (mod && typeof mod.getQuote === 'function') ? mod.getQuote : (mod?.default && typeof mod.default.getQuote === 'function') ? mod.default.getQuote : null;
        const q = getQ ? getQ() : null;
        if (q && q.text) {
          setQuote({ content: q.text, author: q.author || '—' });
        } else {
          const qb = await fetchRandomQuote();
          if (qb) setQuote({ content: qb.content, author: qb.author });
        }
      } catch {
        const qb = await fetchRandomQuote();
        if (qb) setQuote({ content: qb.content, author: qb.author });
      }
    })();

    // Positive todos: prefer affirmations; fallback
    (async () => {
      try {
        const mod: any = await import('affirmations');
        const items: string[] = Array.isArray(mod?.default) ? mod.default : (Array.isArray(mod) ? mod : []);
        const pool = items.length > 0 ? items : FALLBACK_TODOS;
        const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5).map((t, idx) => ({ id: `${Date.now()}-${idx}`, text: t, done: false }));
        const saved = localStorage.getItem('mood_todos');
        if (!saved) {
          setTodos(shuffled);
          localStorage.setItem('mood_todos', JSON.stringify(shuffled));
        } else {
          setTodos(JSON.parse(saved));
        }
      } catch {
        const shuffled = [...FALLBACK_TODOS].sort(() => Math.random() - 0.5).slice(0, 5).map((t, idx) => ({ id: `${Date.now()}-${idx}`, text: t, done: false }));
        const saved = localStorage.getItem('mood_todos');
        if (!saved) {
          setTodos(shuffled);
          localStorage.setItem('mood_todos', JSON.stringify(shuffled));
        } else {
          setTodos(JSON.parse(saved));
        }
      }
    })();

    // Fetch GIF via Giphy Random API with your key and rotating tag
    (async () => {
      try {
        setGifLoading(true);
        const tags = ['inspirational', 'positive', 'motivation', 'meaningful'];
        const tag = tags[Math.floor(Math.random() * tags.length)];
        const url = `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=${encodeURIComponent(tag)}&rating=g`;
        const res = await fetch(url);
        const json = await res.json();
        const img = json?.data?.images;
        const pickedUrl = img?.original?.url || img?.downsized?.url || img?.downsized_large?.url;
        if (pickedUrl) setGifUrl(pickedUrl);
      } catch {
        // ignore
      } finally {
        setGifLoading(false);
      }
    })();
  }, []);

  const toggleTodo = (id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      localStorage.setItem('mood_todos', JSON.stringify(next));
      return next;
    });
  };

  const handleMoodSelect = async (mood: MoodKey) => {
    setSelectedMood(mood);
    setIsLoadingMood(true);
    try {
      await saveDailyMoodAPI(mood);
      setTodayMood(mood);
      toast.success('Đã lưu cảm xúc hôm nay!');
      
      // Reload mood history
      const moodHistory = await getDailyMoodHistoryAPI(7);
      setData(moodHistory);
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Không thể lưu cảm xúc');
    } finally {
      setIsLoadingMood(false);
    }
  };

  const moodCharacters = [
    { 
      key: 'happy' as MoodKey, 
      image: '/emotions/joy.png', 
      label: 'Vui', 
      character: 'Joy',
      color: 'from-amber-400 to-yellow-300', 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-300' 
    },
    { 
      key: 'fear' as MoodKey, 
      image: '/emotions/fear.png', 
      label: 'Sợ hãi', 
      character: 'Fear',
      color: 'from-violet-400 to-purple-300', 
      bgColor: 'bg-violet-50', 
      borderColor: 'border-violet-300' 
    },
    { 
      key: 'sad' as MoodKey, 
      image: '/emotions/sadness.png', 
      label: 'Buồn', 
      character: 'Sadness',
      color: 'from-sky-400 to-blue-300', 
      bgColor: 'bg-sky-50', 
      borderColor: 'border-sky-300' 
    },
    { 
      key: 'angry' as MoodKey, 
      image: '/emotions/anger.png', 
      label: 'Tức giận', 
      character: 'Anger',
      color: 'from-rose-400 to-red-300', 
      bgColor: 'bg-rose-50', 
      borderColor: 'border-rose-300' 
    },
  ];

  return (
    <div className="relative p-4 mx-auto min-h-screen">
      {/* Soft background blobs */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-60 h-60 rounded-full bg-yellow-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -right-12 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">Trang cảm xúc</h1>
          <button className="text-sm text-blue-600 hover:underline" onClick={() => navigate('/')}>Quay lại chat</button>
        </div>

        {/* Main layout: Left side (4 components) + Right side (mood selector) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE - 4 components in 2x2 grid */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-amber-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">Bức sóng cảm xúc (7 ngày)</h2>
              {/* Legend */}
              <div className="flex items-center gap-3 mb-4 text-xs">
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-100 text-amber-700">😊 Vui</span>
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-violet-100 text-violet-700">😨 Sợ hãi</span>
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-sky-100 text-sky-700">😢 Buồn</span>
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-rose-100 text-rose-700">😡 Tức giận</span>
              </div>
            </div>

            {/* 2x2 grid layout: 1) Wave 2) GIF 3) Todos 4) Quote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1) Emotion multi-line chart */}
              <div className="rounded-xl p-4 md:p-6 bg-white/60 border border-white/40 shadow-sm">
                <EmotionLinesChart data={data} />
              </div>

              {/* 2) GIF with fixed aspect ratio */}
              <div className="rounded-xl border border-pink-100 p-5 shadow-sm bg-white/60">
                <h2 className="font-semibold mb-2 text-pink-600">GIF tích cực hôm nay nè</h2>
                <div className="w-full rounded-lg bg-white/60 border border-pink-100 flex items-center justify-center p-3" style={{ aspectRatio: '16 / 9', maxHeight: 360 }}>
                  {gifLoading && <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">Đang tải GIF...</div>}
                  {!gifLoading && gifUrl && (
                    <img src={gifUrl} alt="daily inspirational gif" className="max-w-full max-h-full object-contain" />
                  )}
                </div>
              </div>

              {/* 3) Todos */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-6 shadow-sm">
                <h2 className="font-semibold mb-2 text-emerald-700">Hôm nay là 1 ngày tuyệt vời để: </h2>
                <div className="text-sm text-gray-700 space-y-3">
                  {todos.map((t) => (
                    <label key={t.id} className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-emerald-600"
                        checked={t.done}
                        onChange={() => toggleTodo(t.id)}
                      />
                      <span className={t.done ? 'line-through text-gray-500' : ''}>{t.text}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* 4) Quote */}
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-6 shadow-sm">
                <h2 className="font-semibold mb-2 text-indigo-700">Quote ý nghĩa hôm nay </h2>
                {quote ? (
                  <div className="text-sm text-gray-800">
                    <p className="italic leading-relaxed">"{quote.content}"</p>
                    <p className="mt-2 text-gray-600">— {quote.author}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Đang tải quote...</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Mood selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hôm nay bạn cảm thấy thế nào?
              </h2>
              
              {todayMood && (
                <div className="mb-4 text-center text-sm text-gray-600 bg-white/60 rounded-lg p-2">
                  ✓ Bạn đã chọn cảm xúc hôm nay
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {moodCharacters.map((mood) => (
                  <button
                    key={mood.key}
                    onClick={() => handleMoodSelect(mood.key)}
                    disabled={isLoadingMood}
                    className={`
                      relative group p-6 rounded-2xl border-2 transition-all duration-300
                      ${selectedMood === mood.key 
                        ? `${mood.borderColor} bg-gradient-to-br ${mood.color} shadow-xl scale-105` 
                        : `border-gray-200 ${mood.bgColor} hover:scale-105 hover:shadow-lg`
                      }
                      ${isLoadingMood ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 transform group-hover:scale-110 transition-transform flex items-center justify-center">
                        <img 
                          src={mood.image} 
                          alt={mood.character}
                          className="w-full h-full object-contain drop-shadow-lg"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLDivElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        <div className="text-6xl hidden">
                          {mood.key === 'happy' ? '😊' : mood.key === 'fear' ? '😨' : mood.key === 'sad' ? '😢' : '😡'}
                        </div>
                      </div>
                      <div className={`font-semibold text-lg ${
                        selectedMood === mood.key ? 'text-white' : 'text-gray-700'
                      }`}>
                        {mood.label}
                      </div>
                      <div className={`text-xs ${
                        selectedMood === mood.key ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {mood.character}
                      </div>
                    </div>
                    {selectedMood === mood.key && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center text-xs text-gray-500">
                Chọn một cảm xúc để lưu vào nhật ký của bạn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
