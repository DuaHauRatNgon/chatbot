import React, { useEffect, useMemo, useState } from 'react';
import { fetchMoodHistory, MoodHistoryPoint } from '@/services/yourApiFunctions';

interface MoodHistoryChartProps {
  from?: string;
  to?: string;
}

// Simple stacked bar chart without external libs
export const MoodHistoryChart: React.FC<MoodHistoryChartProps> = ({ from, to }) => {
  const [data, setData] = useState<MoodHistoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchMoodHistory({ from, to });
        if (!cancelled) setData(result);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Lỗi tải dữ liệu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const maxTotal = useMemo(() => {
    return data.reduce((m, d) => Math.max(m, d.total), 0) || 1;
  }, [data]);

  if (loading) return <div className="text-sm text-gray-500">Đang tải lịch sử cảm xúc...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-sm text-gray-500">Chưa có dữ liệu cảm xúc.</div>;

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-40 w-full border border-gray-200 rounded-lg p-3 bg-white">
        {data.map((d) => {
          const happyH = (d.happy / maxTotal) * 100;
          const neutralH = (d.neutral / maxTotal) * 100;
          const sadH = (d.sad / maxTotal) * 100;
          const angryH = (d.angry / maxTotal) * 100;
          return (
            <div key={d.date} className="flex flex-col items-center w-8">
              <div className="flex flex-col justify-end w-full h-28">
                <div style={{ height: `${angryH}%` }} className="w-full bg-red-400 rounded-t-sm" title={`angry: ${d.angry}`}></div>
                <div style={{ height: `${sadH}%` }} className="w-full bg-blue-400" title={`sad: ${d.sad}`}></div>
                <div style={{ height: `${neutralH}%` }} className="w-full bg-gray-300" title={`neutral: ${d.neutral}`}></div>
                <div style={{ height: `${happyH}%` }} className="w-full bg-green-400 rounded-b-sm" title={`happy: ${d.happy}`}></div>
              </div>
              <div className="mt-1 text-[10px] text-gray-600 rotate-[-30deg] origin-top-left h-8 whitespace-nowrap">{d.date.slice(5)}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-gray-700">
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-green-400 rounded-sm"></span>Vui (happy)</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-gray-300 rounded-sm"></span>Trung tính (neutral)</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-blue-400 rounded-sm"></span>Buồn (sad)</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 bg-red-400 rounded-sm"></span>Tức giận (angry)</div>
      </div>
    </div>
  );
};

export default MoodHistoryChart;


