import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface EmotionPoint {
  id: string;
  emotion: string;
  name: string;
  message: string;
  timestamp: Date;
  x: number;
  y: number;
  valence: number;
  arousal: number;
  color: string;
  group: string;
  intensity: number;
}

interface Stats {
  totalMessages: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  avgIntensity: number;
}

export default function EmotionAnalysisPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionPoint | null>(null);
  const [emotions, setEmotions] = useState<EmotionPoint[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    positivePercent: 0,
    negativePercent: 0,
    neutralPercent: 0,
    avgIntensity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEmotionData();
  }, []);

  const fetchEmotionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        const errMsg = 'Chưa đăng nhập. Vui lòng đăng nhập lại.';
        console.error('User data not found in localStorage');
        setError(errMsg);
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Backend trả về user.id (không phải user._id)
      const userId = user.id || user._id;

      if (!userId) {
        const errMsg = 'Không tìm thấy User ID. Vui lòng đăng xuất và đăng nhập lại.';
        console.error('User ID not found in user object');
        setError(errMsg);
        return;
      }
      
      setError(''); // Clear previous errors
      
      const response = await fetch(
        `${API_URL}/api/emotion-analysis/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEmotions(data.data.emotions);
        setStats(data.data.stats);
        setError('');
      } else {
        const errMsg = data.message || 'Không thể lấy dữ liệu cảm xúc';
        console.error('Failed to fetch emotion data:', errMsg);
        setError(errMsg);
      }
    } catch (error: any) {
      const errMsg = error.message || 'Lỗi kết nối server';
      console.error('Error fetching emotion data:', error);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };
  

  // Chuyển đổi tọa độ cảm xúc (-1 to 1) thành pixel (0 to 900)
  const getPixelCoords = (emotion: EmotionPoint) => {
    const chartWidth = 900;
    const chartHeight = 600;
    const centerX = chartWidth / 2;
    const padding = 50; // Increased padding
    
    // Map valence (-1 to 1) to x with more spread
    const x = centerX + emotion.x * (chartWidth / 2 - padding);
    
    // Map arousal (0 to 1) to y (inverted because SVG y increases downward)
    const y = chartHeight - padding - (emotion.y * (chartHeight - padding * 2));
    
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Biểu đồ 2D Cảm xúc
        </h1>
        <p className="text-gray-600 mb-8">
          Biểu đồ 2D hiển thị cảm xúc theo trục Tích cực/Tiêu cực và Mạnh/Yếu (Hiển thị tất cả tin nhắn)
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600">Tổng tin nhắn</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.positivePercent}%</div>
            <div className="text-sm text-gray-600">Cảm xúc tích cực</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-red-600">{stats.negativePercent}%</div>
            <div className="text-sm text-gray-600">Cảm xúc tiêu cực</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.avgIntensity}%</div>
            <div className="text-sm text-gray-600">Cường độ trung bình</div>
          </div>
        </div>
        
        {/* Main Chart */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-red-600 font-medium">⚠️ {error}</div>
              <button 
                onClick={fetchEmotionData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : emotions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-gray-500">Chưa có dữ liệu cảm xúc</div>
              <div className="text-sm text-gray-400">Hãy bắt đầu chat với bot để tạo dữ liệu cảm xúc</div>
            </div>
          </div>
        ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 overflow-x-auto">
            <div className="min-w-[900px]">
              <svg width="900" height="600" className="border-2 border-gray-300 rounded-lg bg-white mx-auto" viewBox="0 0 900 600">
              {/* Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Axes */}
              <line x1="450" y1="40" x2="450" y2="560" stroke="#666" strokeWidth="3" />
              <line x1="40" y1="300" x2="860" y2="300" stroke="#666" strokeWidth="3" />
              
              {/* Labels */}
              <text x="820" y="295" className="text-base font-semibold fill-gray-700">Tích cực</text>
              <text x="50" y="295" className="text-base font-semibold fill-gray-700">Tiêu cực</text>
              <text x="455" y="60" className="text-base font-semibold fill-gray-700">Mạnh</text>
              <text x="455" y="585" className="text-base font-semibold fill-gray-700">Yếu</text>
              
              {/* Emotion Points */}
              {emotions.map((emotion) => {
                const { x, y } = getPixelCoords(emotion);
                const radius = Math.max(8, emotion.intensity / 8); // Larger points
                
                return (
                  <g key={emotion.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={emotion.color}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedEmotion(emotion)}
                    />
                    <text
                      x={x}
                      y={y - radius - 8}
                      className="text-sm font-medium fill-gray-800"
                      textAnchor="middle"
                    >
                      {emotion.name}
                    </text>
                  </g>
                );
              })}
              </svg>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p> <strong>Cách đọc:</strong> Trục ngang = Tiêu cực ↔ Tích cực | Trục dọc = Yếu ↔ Mạnh | Kích thước = Cường độ</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/80 rounded-lg border p-3">
                  <p className="font-medium text-green-700">Nhóm Dương (Positive)</p>
                  <p className="text-xs text-gray-600">Ví dụ: Vui nhẹ (M1), Phấn khích (M3), Tò mò (M1), Kinh ngạc (M3), Thích thú (M1), Say mê (M3)</p>
                </div>
                <div className="bg-white/80 rounded-lg border p-3">
                  <p className="font-medium text-red-700">Nhóm Âm (Negative)</p>
                  <p className="text-xs text-gray-600">Ví dụ: Trầm lắng (M1), Tuyệt vọng (M3), Lo lắng (M1), Hoảng loạn (M3), Khó chịu (M1), Giận dữ (M3), Ác cảm (M1), Căm ghét (M3)</p>
                </div>
                <div className="bg-white/80 rounded-lg border p-3">
                  <p className="font-medium text-purple-700">Mức độ M1 → M3</p>
                  <p className="text-xs text-gray-600">M1 = nhẹ, dịu | M3 = mạnh, dữ dội. Mức cao hơn thường có y (arousal) lớn hơn và kích thước chấm lớn hơn.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Selected Emotion Details */}
        {selectedEmotion && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chi tiết Cảm xúc</h3>
              <button 
                onClick={() => setSelectedEmotion(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedEmotion.color }}
                />
                <div>
                  <h4 className="text-xl font-medium">{selectedEmotion.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedEmotion.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tin nhắn:</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedEmotion.message}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cường độ</p>
                  <p className="text-lg font-semibold text-purple-600">{selectedEmotion.intensity}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nhóm</p>
                  <p className="text-lg font-semibold" style={{
                    color: selectedEmotion.group === 'Positive' ? '#22c55e' : 
                           selectedEmotion.group === 'Negative' ? '#ef4444' : '#6b7280'
                  }}>{selectedEmotion.group}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valence</p>
                  <p className="text-lg font-semibold">{selectedEmotion.valence.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Arousal</p>
                  <p className="text-lg font-semibold">{selectedEmotion.arousal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        
      </div>
    </div>
  );
}
