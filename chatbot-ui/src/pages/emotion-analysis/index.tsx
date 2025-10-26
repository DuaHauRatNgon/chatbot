import { useState } from 'react';

// Mock data mở rộng theo nhóm Dương/Âm với mức M1 (nhẹ) và M3 (mạnh)
// x ~ valence: -1 (Âm) -> +1 (Dương), y ~ arousal: 0 (Yếu) -> 1 (Mạnh)
const mockEmotions = [
  // Dương - Hạnh phúc
  { id: 'pos-happy-m1', group: 'Positive', axis: 'Dương', level: 'M1', name: 'Vui nhẹ', x: 0.6, y: 0.4, color: '#8BC34A', intensity: 55 },
  { id: 'pos-happy-m2', group: 'Positive', axis: 'Dương', level: 'M2', name: 'Hân hoan', x: 0.75, y: 0.55, color: '#A5D6A7', intensity: 70 },
  { id: 'pos-happy-m3', group: 'Positive', axis: 'Dương', level: 'M3', name: 'Phấn khích', x: 0.9, y: 0.9, color: '#FF6B35', intensity: 95 },
  // Dương - Ngạc nhiên
  { id: 'pos-surprise-m1', group: 'Positive', axis: 'Dương', level: 'M1', name: 'Tò mò', x: 0.3, y: 0.5, color: '#03A9F4', intensity: 50 },
  { id: 'pos-surprise-m2', group: 'Positive', axis: 'Dương', level: 'M2', name: 'Ngỡ ngàng', x: 0.5, y: 0.6, color: '#81D4FA', intensity: 65 },
  { id: 'pos-surprise-m3', group: 'Positive', axis: 'Dương', level: 'M3', name: 'Kinh ngạc', x: 0.7, y: 0.85, color: '#FF9800', intensity: 85 },
  // Dương - Yêu thương
  { id: 'pos-love-m1', group: 'Positive', axis: 'Dương', level: 'M1', name: 'Thích thú', x: 0.5, y: 0.4, color: '#E91E63', intensity: 60 },
  { id: 'pos-love-m2', group: 'Positive', axis: 'Dương', level: 'M2', name: 'Mến mộ', x: 0.7, y: 0.5, color: '#F06292', intensity: 70 },
  { id: 'pos-love-m3', group: 'Positive', axis: 'Dương', level: 'M3', name: 'Say mê', x: 0.9, y: 0.6, color: '#C2185B', intensity: 80 },

  // Âm - Buồn
  { id: 'neg-sad-m1', group: 'Negative', axis: 'Âm', level: 'M1', name: 'Trầm lắng', x: -0.4, y: 0.2, color: '#4A90E2', intensity: 40 },
  { id: 'neg-sad-m2', group: 'Negative', axis: 'Âm', level: 'M2', name: 'U sầu', x: -0.6, y: 0.4, color: '#5C6BC0', intensity: 60 },
  { id: 'neg-sad-m3', group: 'Negative', axis: 'Âm', level: 'M3', name: 'Tuyệt vọng', x: -0.9, y: 0.6, color: '#1E3A8A', intensity: 85 },
  // Âm - Sợ hãi
  { id: 'neg-fear-m1', group: 'Negative', axis: 'Âm', level: 'M1', name: 'Lo lắng', x: -0.3, y: 0.6, color: '#9C27B0', intensity: 60 },
  { id: 'neg-fear-m2', group: 'Negative', axis: 'Âm', level: 'M2', name: 'Bất an', x: -0.55, y: 0.7, color: '#BA68C8', intensity: 75 },
  { id: 'neg-fear-m3', group: 'Negative', axis: 'Âm', level: 'M3', name: 'Hoảng loạn', x: -0.7, y: 0.95, color: '#6A1B9A', intensity: 92 },
  // Âm - Tức giận
  { id: 'neg-anger-m1', group: 'Negative', axis: 'Âm', level: 'M1', name: 'Khó chịu', x: -0.5, y: 0.5, color: '#F87171', intensity: 65 },
  { id: 'neg-anger-m2', group: 'Negative', axis: 'Âm', level: 'M2', name: 'Bực bội', x: -0.7, y: 0.7, color: '#EF4444', intensity: 78 },
  { id: 'neg-anger-m3', group: 'Negative', axis: 'Âm', level: 'M3', name: 'Giận dữ', x: -0.85, y: 0.9, color: '#E74C3C', intensity: 90 },
  // Âm - Ghê tởm
  { id: 'neg-disgust-m1', group: 'Negative', axis: 'Âm', level: 'M1', name: 'Ác cảm', x: -0.4, y: 0.4, color: '#2E7D32', intensity: 55 },
  { id: 'neg-disgust-m2', group: 'Negative', axis: 'Âm', level: 'M2', name: 'Ghê ghê', x: -0.6, y: 0.55, color: '#43A047', intensity: 68 },
  { id: 'neg-disgust-m3', group: 'Negative', axis: 'Âm', level: 'M3', name: 'Căm ghét', x: -0.75, y: 0.7, color: '#1B5E20', intensity: 80 },
];

export default function EmotionAnalysisPage() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  

  // Jitter ngẫu nhiên (ổn định theo id) để các điểm không thẳng hàng ngang
  const hashToUnit = (str: string) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    // Convert to 0..1
    return (h >>> 0) / 4294967295;
  };

  // Trả về yOffset có jitter theo level nhưng vẫn giữ trong dải hợp lệ
  // Dải đề xuất (đơn vị chuẩn hóa -1..+1 trước khi nhân centerY):
  //   M1: +0.20 .. +0.50 (dưới trục)
  //   M2: -0.08 .. +0.08 (gần trục)
  //   M3: -0.50 .. -0.20 (trên trục)
  const getJitteredYOffset = (level: string | undefined, id: string) => {
    const r = hashToUnit(id);
    if (level === 'M1') {
      return 0.20 + r * (0.50 - 0.20);
    } else if (level === 'M2') {
      return -0.08 + r * (0.16); // [-0.08, +0.08]
    } else if (level === 'M3') {
      return -0.50 + r * (0.30); // [-0.50, -0.20]
    }
    return 0;
  };

  // Giãn cách ngang mạnh hơn + jitter theo id để tránh chồng
  const getJitteredX = (xNorm: number, id: string, width: number) => {
    const r = hashToUnit(id + '-x');
    // Nới rộng ra gần rìa và thêm jitter ±0.15
    let xn = xNorm + (r - 0.5) * 0.30;
    // Clamp trong [-0.98, 0.98]
    xn = Math.max(-0.98, Math.min(0.98, xn));
    const centerX = width / 2;
    return centerX + xn * centerX * 0.95; // 0.95 để trải rộng tối đa
  };
  
  // Chuyển đổi tọa độ cảm xúc (-1 to 1) thành pixel (0 to 500)
  const getPixelCoords = (emotion) => {
    const chartWidth = 500;
    const chartHeight = 300; // reserved for future use
    const centerY = chartHeight / 2;
    
    // X phụ thuộc valence (Dương/Âm) + jitter để giãn cách
    const x = getJitteredX(emotion.x, emotion.id, chartWidth);
    // Y: mức độ + jitter ngẫu nhiên ổn định theo id
    const yOffset = getJitteredYOffset(emotion.level, emotion.id); // -1 .. +1
    const y = centerY + (yOffset * centerY * 0.8);
    
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Phân tích Cảm xúc đẳng cấp pro vip vũ trụ
        </h1>
        <p className="text-gray-600 mb-8">
          Biểu đồ 2D hiển thị cảm xúc theo trục Tích cực/Tiêu cực và Mạnh/Yếu
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-green-600">67%</div>
            <div className="text-sm text-gray-600">Cảm xúc tích cực</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-red-600">33%</div>
            <div className="text-sm text-gray-600">Cảm xúc tiêu cực</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold text-purple-600">75%</div>
            <div className="text-sm text-gray-600">Cường độ trung bình</div>
          </div>
        </div>
        
        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Biểu đồ 2D Cảm xúc</h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
            <svg width="500" height="300" className="border rounded-lg bg-white mx-auto">
              {/* Grid */}
              <defs>
                <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Axes */}
              <line x1="250" y1="20" x2="250" y2="280" stroke="#666" strokeWidth="2" />
              <line x1="20" y1="150" x2="480" y2="150" stroke="#666" strokeWidth="2" />
              
              {/* Labels */}
              <text x="460" y="145" className="text-xs fill-gray-600">Tích cực</text>
              <text x="30" y="145" className="text-xs fill-gray-600">Tiêu cực</text>
              <text x="255" y="30" className="text-xs fill-gray-600">Mạnh</text>
              <text x="255" y="295" className="text-xs fill-gray-600">Yếu</text>
              
              {/* Emotion Points */}
              {mockEmotions.map((emotion) => {
                const { x, y } = getPixelCoords(emotion);
                const radius = Math.max(6, emotion.intensity / 10);
                
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
                      y={y - radius - 5}
                      className="text-xs fill-gray-700"
                      textAnchor="middle"
                    >
                      {emotion.name} ({emotion.level})
                    </text>
                  </g>
                );
              })}
            </svg>
            
            <div className="mt-4 text-sm text-gray-600">
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
            
            <div className="flex items-center gap-4">
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: selectedEmotion.color }}
              />
              <div>
                <h4 className="text-xl font-medium">{selectedEmotion.name}</h4>
                <p className="text-gray-600">Cường độ: {selectedEmotion.intensity}%</p>
                <p className="text-gray-600">
                  Tọa độ: ({selectedEmotion.x.toFixed(1)}, {selectedEmotion.y.toFixed(1)})
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Debug Info */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Trạng thái:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Route /emotion-analysis hoạt động</li>
            <li>✅ Component render thành công</li>
            <li>✅ SVG biểu đồ hiển thị</li>
            <li>✅ Tương tác click hoạt động</li>
            <li>✅ Mock data 6 cảm xúc</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
