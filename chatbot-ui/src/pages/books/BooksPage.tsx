import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { books } from '@/data/books';
import { BookOpen, Download, Home, Sparkles } from 'lucide-react';

export default function BooksPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const selected = useMemo(() => books.find(b => b.slug === slug), [slug]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 text-gray-900 dark:text-white p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="flex items-center justify-between mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100 dark:border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Thư viện Sách PDF
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Khám phá tri thức mỗi ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected && (
              <a 
                href={selected.file} 
                download 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Tải PDF</span>
              </a>
            )}
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Books Grid */}
          <div className="md:col-span-1">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-purple-100 dark:border-purple-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Bộ sưu tập</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
                {books.map((b, index) => (
                  <button
                    key={b.slug}
                    onClick={() => navigate(slug === b.slug ? '/books' : `/books/${b.slug}`)}
                    className={`group text-left rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                      slug === b.slug 
                        ? 'ring-4 ring-purple-400 dark:ring-purple-600 shadow-2xl shadow-purple-300/50 dark:shadow-purple-900/50' 
                        : 'hover:shadow-xl shadow-md'
                    }`}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      <img 
                        src={b.cover} 
                        alt={b.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      {slug === b.slug && (
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 to-transparent flex items-end justify-center pb-2">
                          <span className="text-white text-xs font-semibold bg-purple-600 px-3 py-1 rounded-full shadow-lg">
                            Đang đọc
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Tập {index + 1}
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800">
                      <div className="text-xs md:text-sm font-medium line-clamp-2 text-gray-700 dark:text-gray-200">
                        {b.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="md:col-span-2">
            <div className="w-full h-[70vh] md:h-[82vh] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl overflow-hidden shadow-2xl">
              {selected ? (
                <div className="w-full h-full flex flex-col">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-semibold text-sm md:text-base">{selected.title}</span>
                    </div>
                  </div>
                  <iframe 
                    title={selected.title} 
                    src={selected.file} 
                    className="w-full flex-1 bg-white" 
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-full shadow-2xl mb-6 animate-bounce">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Chào mừng đến với Thư viện!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    Chọn một cuốn sách ở bên trái để bắt đầu hành trình khám phá tri thức của bạn
                  </p>
                  <div className="mt-6 flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                        style={{
                          animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}


