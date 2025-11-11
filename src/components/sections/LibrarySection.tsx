import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type BookData = {
  genre: string[];
  title: string;
  description: string;
  idea: string;
  characters: any[];
  turningPoint: string;
  uniqueFeatures: string;
  pages: string;
  writingStyle: string[];
  textTone: string[];
  illustrations: any;
  generatedImages: string[];
  chapters?: { title: string; text: string }[];
};

interface LibrarySectionProps {
  books: Array<BookData & { id: string }>;
  onEditBook: (book: BookData & { id: string }) => void;
  onDeleteBook: (id: string) => void;
  onCreateNew: () => void;
}

const LibrarySection = ({ books, onEditBook, onDeleteBook, onCreateNew }: LibrarySectionProps) => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Icon name="Sparkles" className="w-7 h-7 text-black" />
          <h2 className="text-4xl font-bold text-black">
            Моя библиотека
          </h2>
          <Icon name="Sparkles" className="w-7 h-7 text-black" />
        </div>

        {books.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Icon name="BookOpen" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">У вас пока нет созданных книг</p>
              <Button onClick={onCreateNew}>
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Создать первую книгу
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {book.generatedImages[0] && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={book.generatedImages[0]}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{book.title}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {book.genre.map((g, idx) => (
                        <Badge key={idx} variant="secondary">{g}</Badge>
                      ))}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {book.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditBook(book)}
                        className="flex-1"
                      >
                        <Icon name="Edit" className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteBook(book.id)}
                        className="flex-1"
                      >
                        <Icon name="Trash2" className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditBook(book)}
                        className="flex-1"
                      >
                        <Icon name="BookOpen" className="w-4 h-4 mr-1" />
                        Открыть
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Icon name="Download" className="w-4 h-4 mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;