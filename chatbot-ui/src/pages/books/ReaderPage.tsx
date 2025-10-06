import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { books } from '@/data/books';

export default function ReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const book = useMemo(() => books.find((b) => b.slug === slug), [slug]);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <div className="text-center">
          <p className="mb-4">Không tìm thấy sách.</p>
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/books')}>Quay lại thư viện</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h1 className="text-base md:text-lg font-semibold line-clamp-1">{book.title}</h1>
          <div className="flex items-center gap-3">
            <a href={book.file} download className="text-sm text-blue-600 hover:underline">Tải PDF</a>
            <button className="text-sm text-blue-600 hover:underline" onClick={() => navigate('/books')}>Danh sách</button>
          </div>
        </div>

        <div className="w-full h-[80vh] md:h-[85vh] border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {/* Use native PDF viewer for speed and lightness */}
          <iframe
            title={book.title}
            src={book.file}
            className="w-full h-full bg-white"
          />
        </div>
      </div>
    </div>
  );
}


