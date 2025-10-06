export type BookItem = {
  slug: string;
  title: string;
  cover: string;
  file: string;
};

export const books: BookItem[] = Array.from({ length: 8 }, (_, i) => {
  const index = i + 1;
  return {
    slug: `hat-giong-tam-hon-tap-${index}`,
    title: `Hạt Giống Tâm Hồn - Tập ${index}`,
    cover: `/book-covers/hat-giong-tam-hon-tap-${index}.jpg`,
    file: `/pdf/hat-giong-tam-hon-tap-${index}.pdf`
  };
});
