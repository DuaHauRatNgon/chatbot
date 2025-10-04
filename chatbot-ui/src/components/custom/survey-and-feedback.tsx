import { ExternalLink } from 'lucide-react';
import { useSurveysAndFeedback } from '@/hooks/useSurveysAndFeedback'; // đường dẫn hook của bạn

export const SurveyAndFeedback = () => {
  const { data: surveyForms, loading, error } = useSurveysAndFeedback();

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <div className="space-y-3 pb-8">

          {loading && <p className="text-sm text-gray-500">Đang tải khảo sát...</p>}
          {error && <p className="text-sm text-red-500">Lỗi: {error}</p>}
          {!loading && !error && surveyForms && surveyForms.length === 0 && (
            <p className="text-sm text-gray-500">Không có khảo sát nào.</p>
          )}

          {!loading && !error && surveyForms?.map((form) => (
            <div
              key={form._id}
              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-800 leading-tight">
                  {form.title}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                  {form.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {form.description}
              </p>
              <button
                onClick={() => window.open(form.link, '_blank')}
                className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Tham gia khảo sát
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};
