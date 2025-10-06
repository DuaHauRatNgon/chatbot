import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { books } from '@/data/books';

export default function BooksPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const selected = useMemo(() => books.find(b => b.slug === slug), [slug]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl md:text-2xl font-bold">Thư viện Sách PDF</h1>
          <div className="flex items-center gap-3">
            {selected && (
              <a href={selected.file} download className="text-sm text-blue-600 hover:underline">Tải PDF</a>
            )}
            <Link to="/" className="text-sm text-blue-600 hover:underline">Quay lại chat</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3">
              {books.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => navigate(slug === b.slug ? '/books' : `/books/${b.slug}`)}
                  className={`group text-left rounded-lg overflow-hidden border ${slug === b.slug ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-gray-200 dark:border-gray-800'} hover:shadow-md transition-shadow`}
                >
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img src={b.cover} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2">
                    <div className="text-xs md:text-sm font-medium line-clamp-2">{b.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="w-full h-[70vh] md:h-[82vh] border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
              {selected ? (
                <iframe title={selected.title} src={selected.file} className="w-full h-full bg-white" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  Chọn một cuốn sách ở bên trái để bắt đầu đọc
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


