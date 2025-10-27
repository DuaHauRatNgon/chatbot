import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, AlertTriangle, Info, X, Brain, Loader2, Save } from 'lucide-react';
import { AssessmentAnswerResponse } from '@/interfaces/interfaces';
import { generateAIRecommendations } from '@/services/aiRecommendations';
import { toast } from 'sonner';

interface AssessmentResultsProps {
  result: AssessmentAnswerResponse;
  onClose: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  result,
  onClose
}) => {
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate AI recommendations khi component mount
  useEffect(() => {
    const generateRecommendations = async () => {
      // Nếu đã có recommendations từ API và đầy đủ, không cần generate AI
      if (result.recommendations && 
          result.recommendations.immediateActions && 
          result.recommendations.immediateActions.length > 0) {
        return;
      }

      // Nếu không có assessment data, skip
      if (!result.assessment) {
        return;
      }
      setIsGeneratingAI(true);
      setAiError(null);

      try {
        const aiRecs = await generateAIRecommendations(
          result.assessment,
          result.totalScore || 0,
          result.interpretation || ''
        );
        setAiRecommendations(aiRecs);
      } catch (error) {
        console.error('[ERROR] Failed to generate AI recommendations:', error);
        setAiError('Không thể tạo khuyến nghị AI. Sử dụng khuyến nghị mặc định.');
      } finally {
        setIsGeneratingAI(false);
      }
    };

    generateRecommendations();
  }, [result]);

  // Handler để lưu kết quả (tạm thời giả lập)
  const handleSaveResults = async () => {
    setIsSaving(true);
    
    // Giả lập việc lưu với setTimeout (1.5 giây)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Thông báo thành công
      toast.success('Lưu kết quả thành công!', {
        description: 'Kết quả đánh giá đã được lưu vào hệ thống',
        duration: 3000,
      });
      
    } catch (error) {
      // Xử lý lỗi (nếu có)
      toast.error('Có lỗi xảy ra khi lưu kết quả', {
        description: 'Vui lòng thử lại sau',
        duration: 3000,
      });
      console.error('[Assessment] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Tạo recommendations mặc định nếu AI fail
  const getFallbackRecommendations = () => {
    const interpretation = result.interpretation || '';
    const isHighSeverity = interpretation.includes('nặng') || interpretation.includes('cao');
    const isModerateSeverity = interpretation.includes('nhẹ') || interpretation.includes('trung bình');
    
    return {
      immediateActions: isHighSeverity ? [
        'Tìm kiếm sự hỗ trợ từ gia đình và bạn bè',
        'Liên hệ với chuyên gia tâm lý để được tư vấn',
        'Tránh các quyết định quan trọng khi tâm trạng không ổn định'
      ] : isModerateSeverity ? [
        'Dành thời gian cho bản thân mỗi ngày',
        'Thực hiện các hoạt động thư giãn',
        'Chia sẻ cảm xúc với người tin tưởng'
      ] : [
        'Duy trì lối sống lành mạnh hiện tại',
        'Tiếp tục các hoạt động tích cực'
      ],
      
      dailyPractices: [
        'Thực hiện bài tập thở sâu 5-10 phút mỗi ngày',
        'Duy trì giấc ngủ đủ 7-8 tiếng mỗi đêm',
        'Tập thể dục nhẹ nhàng 20-30 phút',
        'Viết nhật ký cảm xúc',
        'Thực hành chánh niệm (mindfulness)'
      ],
      
      professionalHelp: {
        needed: isHighSeverity,
        urgency: isHighSeverity ? 'Cao' : isModerateSeverity ? 'Trung bình' : 'Thấp',
        recommendations: isHighSeverity ? [
          'Tham khảo ý kiến bác sĩ tâm lý hoặc psychiatrist',
          'Cân nhắc liệu pháp tâm lý (CBT, DBT)',
          'Tham gia nhóm hỗ trợ'
        ] : isModerateSeverity ? [
          'Tư vấn tâm lý ngắn hạn',
          'Tham gia các khóa học quản lý stress'
        ] : []
      },
      
      resources: [
        'Ứng dụng thiền định: Headspace, Calm',
        'Sách: "Tâm lý học tích cực" - Martin Seligman',
        'Đường dây nóng tâm lý: 1900 6013',
        'Website: https://www.who.int/mental_health',
        'Ứng dụng theo dõi tâm trạng: Daylio, Mood Meter'
      ],
      
      followUp: {
        timeline: isHighSeverity ? '1-2 tuần' : isModerateSeverity ? '1 tháng' : '3 tháng',
        actions: [
          'Thực hiện lại bài đánh giá để theo dõi tiến triển',
          'Đánh giá hiệu quả của các biện pháp đã áp dụng',
          'Điều chỉnh kế hoạch chăm sóc nếu cần thiết'
        ]
      },
      
      aiGenerated: false
    };
  };
  
  // Ưu tiên: API recommendations > AI recommendations > Fallback
  const recommendations = result.recommendations || aiRecommendations || getFallbackRecommendations();
  
  const getSeverityColor = (interpretation: string) => {
    if (interpretation.includes('tối thiểu') || interpretation.includes('thấp')) {
      return 'text-green-600 dark:text-green-400';
    }
    if (interpretation.includes('nhẹ') || interpretation.includes('trung bình')) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    if (interpretation.includes('nặng') || interpretation.includes('cao')) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-blue-600 dark:text-blue-400';
  };

  const getSeverityIcon = (interpretation: string) => {
    if (interpretation.includes('tối thiểu') || interpretation.includes('thấp')) {
      return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
    }
    if (interpretation.includes('nhẹ') || interpretation.includes('trung bình')) {
      return <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
    }
    if (interpretation.includes('nặng') || interpretation.includes('cao')) {
      return <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />;
    }
    return <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Kết quả Đánh giá
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Điểm số: {result.totalScore} / {result.assessment?.scaleType}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Score and Interpretation */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                {getSeverityIcon(result.interpretation || '')}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Kết quả đánh giá
                  </h4>
                  <p className={`text-lg font-semibold ${getSeverityColor(result.interpretation || '')}`}>
                    {result.interpretation}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Thang đo:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {result.assessment?.scaleType}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Điểm số:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {result.totalScore}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Ngày hoàn thành:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(result.assessment?.completedAt || '').toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(result.assessment?.startedAt || '').toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Context Info */}
            {result.aiContext && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <h4 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Phân tích AI
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-purple-700 dark:text-purple-300">Độ tin cậy:</span>
                    <span className="ml-2 text-purple-600 dark:text-purple-400">
                      {Math.round((result.aiContext.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700 dark:text-purple-300">Mối quan tâm chính:</span>
                    <span className="ml-2 text-purple-600 dark:text-purple-400">
                      {result.aiContext.primaryConcern || 'Không xác định'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700 dark:text-purple-300">Mức độ nghiêm trọng:</span>
                    <span className="ml-2 text-purple-600 dark:text-purple-400">
                      {result.aiContext.severity || 'Không xác định'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700 dark:text-purple-300">Mức độ khẩn cấp:</span>
                    <span className="ml-2 text-purple-600 dark:text-purple-400">
                      {result.aiContext.urgency || 'Không xác định'}
                    </span>
                  </div>
                </div>
                {result.aiContext.keyIndicators && result.aiContext.keyIndicators.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-purple-700 dark:text-purple-300">Dấu hiệu phát hiện:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.aiContext.keyIndicators.map((indicator, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    Khuyến nghị
                  </h4>
                  {isGeneratingAI && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">AI đang phân tích...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {aiError && (
                    <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                      Fallback
                    </span>
                  )}
                  {aiRecommendations && (
                    <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-xs flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      AI Powered
                    </span>
                  )}
                  {result.recommendations?.aiGenerated && (
                    <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                      API Generated
                    </span>
                  )}
                </div>
              </div>

              {/* AI Analysis Reasoning */}
              {aiRecommendations?.reasoning && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-purple-800 dark:text-purple-200 text-sm mb-1">
                        Phân tích AI:
                      </h5>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">
                        {aiRecommendations.reasoning}
                      </p>
                      {aiRecommendations.confidence && (
                        <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">
                          Độ tin cậy: {Math.round(aiRecommendations.confidence * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {aiError}
                    </p>
                  </div>
                </div>
              )}

                {/* Immediate Actions */}
                {recommendations.immediateActions && recommendations.immediateActions.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Hành động ngay lập tức:</h5>
                    <ul className="space-y-2">
                      {recommendations.immediateActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800 dark:text-blue-200">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Daily Practices */}
                {recommendations.dailyPractices && recommendations.dailyPractices.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Thực hành hàng ngày:</h5>
                    <ul className="space-y-2">
                      {recommendations.dailyPractices.map((practice, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800 dark:text-blue-200">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Professional Help */}
                {recommendations.professionalHelp && recommendations.professionalHelp.needed && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h5 className="font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Cần hỗ trợ chuyên môn
                    </h5>
                    {recommendations.professionalHelp.recommendations && (
                      <ul className="space-y-2">
                        {recommendations.professionalHelp.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-red-800 dark:text-red-200">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {recommendations.professionalHelp.urgency && (
                      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                        Mức độ khẩn cấp: {recommendations.professionalHelp.urgency}
                      </p>
                    )}
                  </div>
                )}

                {/* Resources */}
                {recommendations.resources && recommendations.resources.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Tài nguyên hỗ trợ:</h5>
                    <ul className="space-y-2">
                      {recommendations.resources.map((resource, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-blue-800 dark:text-blue-200">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow Up */}
                {recommendations.followUp && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Theo dõi tiếp theo:</h5>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Thời gian: {recommendations.followUp.timeline}
                    </p>
                    {recommendations.followUp.actions && (
                      <ul className="mt-2 space-y-1">
                        {recommendations.followUp.actions.map((action, index) => (
                          <li key={index} className="text-yellow-700 dark:text-yellow-300 text-sm">
                            • {action}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-yellow-800 dark:text-yellow-200">
                  <h4 className="font-medium mb-2">Lưu ý quan trọng</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Kết quả này chỉ mang tính chất sàng lọc và tham khảo</li>
                    <li>• Không thay thế cho chẩn đoán chuyên nghiệp của bác sĩ tâm lý</li>
                    <li>• Nếu bạn có những lo lắng nghiêm trọng, hãy tham khảo ý kiến chuyên gia</li>
                    <li>• Trong trường hợp khẩn cấp, hãy liên hệ đường dây nóng tâm lý</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Đóng
            </Button>
            <Button 
              onClick={handleSaveResults}
              disabled={isSaving}
              className="min-w-[140px]"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Lưu kết quả</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
