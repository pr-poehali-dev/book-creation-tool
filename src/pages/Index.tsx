import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import InteractiveAvatar from '@/components/InteractiveAvatar';
import SwanDecoration from '@/components/SwanDecoration';
import { toast } from 'sonner';
import { auth, booksApi, User } from '@/lib/auth';
import { worldWriters } from '@/data/writers';

type Character = {
  id: string;
  name: string;
  age: string;
  appearance: string;
  personality: string;
  background: string;
  motivation: string;
  role: 'main' | 'secondary' | 'villain';
};

type IllustrationSettings = {
  count: number;
  style: string;
  colorScheme: string;
  mood: string;
};

type Chapter = {
  title: string;
  text: string;
};

type BookData = {
  genre: string[];
  title: string;
  description: string;
  idea: string;
  characters: Character[];
  turningPoint: string;
  uniqueFeatures: string;
  pages: string;
  writingStyle: string[];
  textTone: string[];
  illustrations: IllustrationSettings;
  generatedImages: string[];
  chapters?: Chapter[];
};

const GENRES = [
  'фантастика',
  'фэнтези',
  'детектив',
  'приключения',
  'исторический',
  'современный',
  'роман',
  'триллер',
  'мистика',
  'ужасы',
  'дистопия',
  'комедия',
  'драма',
  'поэзия'
];

const WRITING_STYLES = [
  'классический',
  'современный',
  'поэтический',
  'журналистский',
  'минималистичный',
  'барочный',
  'реалистический',
  'романтический',
  'экспрессионистский'
];

const TEXT_TONES = [
  'торжественный',
  'лирический',
  'ироничный',
  'драматический',
  'легкий',
  'философский',
  'сатирический',
  'меланхоличный',
  'энергичный'
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'form' | 'library' | 'help' | 'auth' | 'writers'>('home');
  const [formStep, setFormStep] = useState<'basic' | 'characters' | 'illustrations' | 'settings'>('basic');
  const [books, setBooks] = useState<Array<BookData & { id: string }>>([]);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [editingBook, setEditingBook] = useState<string | null>(null);
  
  const [currentCharacter, setCurrentCharacter] = useState<Omit<Character, 'id'>>({
    name: '',
    age: '',
    appearance: '',
    personality: '',
    background: '',
    motivation: '',
    role: 'main'
  });

  const [currentBook, setCurrentBook] = useState<BookData>({
    genre: [],
    title: '',
    description: '',
    idea: '',
    characters: [],
    turningPoint: '',
    uniqueFeatures: '',
    pages: '',
    writingStyle: [],
    textTone: [],
    illustrations: {
      count: 3,
      style: 'realistic',
      colorScheme: 'warm',
      mood: 'dramatic'
    },
    generatedImages: []
  });

  useEffect(() => {
    const currentUser = auth.getUser();
    setUser(currentUser);
    if (currentUser) {
      loadBooks();
    }
  }, []);

  const loadBooks = async () => {
    try {
      const fetchedBooks = await booksApi.getBooks();
      const mappedBooks = fetchedBooks.map((book: any) => ({
        id: book.id.toString(),
        title: book.title,
        genre: Array.isArray(book.genre) ? book.genre : [book.genre],
        description: book.description,
        idea: book.idea,
        characters: book.characters.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          age: c.age,
          appearance: c.appearance,
          personality: c.personality,
          background: c.background,
          motivation: c.motivation,
          role: c.role
        })),
        turningPoint: book.turning_point,
        uniqueFeatures: book.unique_features,
        pages: book.pages,
        writingStyle: Array.isArray(book.writing_style) ? book.writing_style : [book.writing_style],
        textTone: Array.isArray(book.text_tone) ? book.text_tone : [book.text_tone],
        illustrations: {
          count: book.illustrations.length,
          style: book.illustrations[0]?.style || 'realistic',
          colorScheme: book.illustrations[0]?.color_scheme || 'warm',
          mood: book.illustrations[0]?.mood || 'dramatic'
        },
        generatedImages: book.illustrations.map((i: any) => i.image_url),
        chapters: book.chapters.map((ch: any) => ({
          title: ch.title,
          text: ch.text
        }))
      }));
      setBooks(mappedBooks);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAuth = async () => {
    try {
      if (authMode === 'register') {
        const response = await auth.register(authForm.email, authForm.password, authForm.name);
        setUser(response.user);
        toast.success('Регистрация успешна!');
      } else {
        const response = await auth.login(authForm.email, authForm.password);
        setUser(response.user);
        toast.success('Вход выполнен!');
      }
      setActiveSection('home');
      setAuthForm({ email: '', password: '', name: '' });
      loadBooks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setBooks([]);
    setActiveSection('home');
    toast.success('Вы вышли из аккаунта');
  };

  const handleInputChange = (field: keyof BookData, value: any) => {
    setCurrentBook(prev => ({ ...prev, [field]: value }));
  };

  const handleCharacterChange = (field: keyof Omit<Character, 'id'>, value: string) => {
    setCurrentCharacter(prev => ({ ...prev, [field]: value }));
  };

  const handleGenreToggle = (genre: string) => {
    setCurrentBook(prev => {
      const genres = prev.genre || [];
      if (genres.includes(genre)) {
        return { ...prev, genre: genres.filter(g => g !== genre) };
      } else if (genres.length < 3) {
        return { ...prev, genre: [...genres, genre] };
      } else {
        toast.error('Можно выбрать максимум 3 жанра');
        return prev;
      }
    });
  };

  const handleWritingStyleToggle = (style: string) => {
    setCurrentBook(prev => {
      const styles = prev.writingStyle || [];
      if (styles.includes(style)) {
        return { ...prev, writingStyle: styles.filter(s => s !== style) };
      } else if (styles.length < 3) {
        return { ...prev, writingStyle: [...styles, style] };
      } else {
        toast.error('Можно выбрать максимум 3 стиля');
        return prev;
      }
    });
  };

  const handleTextToneToggle = (tone: string) => {
    setCurrentBook(prev => {
      const tones = prev.textTone || [];
      if (tones.includes(tone)) {
        return { ...prev, textTone: tones.filter(t => t !== tone) };
      } else if (tones.length < 3) {
        return { ...prev, textTone: [...tones, tone] };
      } else {
        toast.error('Можно выбрать максимум 3 тона');
        return prev;
      }
    });
  };

  const addCharacter = () => {
    if (!currentCharacter.name) {
      toast.error('Введите имя персонажа');
      return;
    }
    
    if (editingCharacter) {
      setCurrentBook(prev => ({
        ...prev,
        characters: prev.characters.map(c => 
          c.id === editingCharacter.id ? { ...currentCharacter, id: editingCharacter.id } : c
        )
      }));
      toast.success('Персонаж обновлён');
    } else {
      const newCharacter: Character = {
        ...currentCharacter,
        id: Date.now().toString()
      };
      setCurrentBook(prev => ({
        ...prev,
        characters: [...prev.characters, newCharacter]
      }));
      toast.success('Персонаж добавлен');
    }
    
    setCurrentCharacter({
      name: '',
      age: '',
      appearance: '',
      personality: '',
      background: '',
      motivation: '',
      role: 'main'
    });
    setEditingCharacter(null);
    setIsCharacterDialogOpen(false);
  };

  const editCharacter = (character: Character) => {
    setEditingCharacter(character);
    setCurrentCharacter({
      name: character.name,
      age: character.age,
      appearance: character.appearance,
      personality: character.personality,
      background: character.background,
      motivation: character.motivation,
      role: character.role
    });
    setIsCharacterDialogOpen(true);
  };

  const deleteCharacter = (id: string) => {
    setCurrentBook(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id)
    }));
    toast.success('Персонаж удалён');
  };

  const handleEditBook = (book: BookData & { id: string }) => {
    setEditingBook(book.id);
    setCurrentBook({
      genre: book.genre,
      title: book.title,
      description: book.description,
      idea: book.idea,
      characters: book.characters,
      turningPoint: book.turningPoint,
      uniqueFeatures: book.uniqueFeatures,
      pages: book.pages,
      writingStyle: book.writingStyle,
      textTone: book.textTone,
      illustrations: book.illustrations,
      generatedImages: book.generatedImages,
      chapters: book.chapters
    });
    setActiveSection('form');
    setFormStep('basic');
  };

  const handleChapterEdit = (bookId: string, chapterIndex: number, newText: string) => {
    setBooks(prev => prev.map(book => {
      if (book.id === bookId && book.chapters) {
        const updatedChapters = [...book.chapters];
        updatedChapters[chapterIndex] = { ...updatedChapters[chapterIndex], text: newText };
        return { ...book, chapters: updatedChapters };
      }
      return book;
    }));
  };

  const generateIllustrations = async () => {
    setIsGeneratingImages(true);
    toast.info(`Генерирую ${currentBook.illustrations.count} иллюстраций...`);
    
    const images: string[] = [];
    
    for (let i = 0; i < currentBook.illustrations.count; i++) {
      try {
        const prompt = `Book illustration for "${currentBook.title}", ${currentBook.genre.join(', ')} genre, ${currentBook.illustrations.style} art style, ${currentBook.illustrations.colorScheme} color palette, ${currentBook.illustrations.mood} mood, scene ${i + 1} of ${currentBook.illustrations.count}, professional book cover quality`;
        
        const response = await fetch('https://poehali.dev/.api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        images.push(data.url);
        toast.success(`Иллюстрация ${i + 1}/${currentBook.illustrations.count} готова`);
      } catch (error) {
        toast.error(`Ошибка генерации иллюстрации ${i + 1}`);
      }
    }
    
    setCurrentBook(prev => ({ ...prev, generatedImages: images }));
    setIsGeneratingImages(false);
  };

  const generateBook = async () => {
    if (!user) {
      toast.error('Войдите в аккаунт для создания книги');
      setActiveSection('auth');
      return;
    }

    if (!currentBook.genre.length || !currentBook.title || !currentBook.idea) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setIsGeneratingBook(true);
    
    try {
      const bookPayload = {
        title: currentBook.title,
        genre: currentBook.genre,
        description: currentBook.description,
        idea: currentBook.idea,
        turning_point: currentBook.turningPoint,
        unique_features: currentBook.uniqueFeatures,
        pages: parseInt(currentBook.pages) || 100,
        writing_style: currentBook.writingStyle,
        text_tone: currentBook.textTone,
        characters: currentBook.characters.map(c => ({
          name: c.name,
          age: c.age,
          appearance: c.appearance,
          personality: c.personality,
          background: c.background,
          motivation: c.motivation,
          role: c.role
        })),
        illustrations: currentBook.generatedImages.map((url, idx) => ({
          image_url: url,
          style: currentBook.illustrations.style,
          color_scheme: currentBook.illustrations.colorScheme,
          mood: currentBook.illustrations.mood,
          position: idx
        }))
      };

      let createdBook;
      if (editingBook) {
        createdBook = await booksApi.updateBook(editingBook, bookPayload);
        toast.success('Книга обновлена!');
      } else {
        createdBook = await booksApi.createBook(bookPayload);
        toast.success('Книга создана!');
      }

      await loadBooks();
      
      setCurrentBook({
        genre: [],
        title: '',
        description: '',
        idea: '',
        characters: [],
        turningPoint: '',
        uniqueFeatures: '',
        pages: '',
        writingStyle: [],
        textTone: [],
        illustrations: {
          count: 3,
          style: 'realistic',
          colorScheme: 'warm',
          mood: 'dramatic'
        },
        generatedImages: []
      });
      setEditingBook(null);
      setActiveSection('library');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGeneratingBook(false);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await booksApi.deleteBook(id);
      toast.success('Книга удалена');
      loadBooks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      <SwanDecoration position="left" />
      <SwanDecoration position="right" />
      
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="book-open" className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BookGen AI
              </h1>
            </div>
            
            <nav className="flex items-center gap-4">
              <Button
                variant={activeSection === 'home' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('home')}
              >
                <Icon name="home" className="h-4 w-4 mr-2" />
                Главная
              </Button>
              
              {user && (
                <>
                  <Button
                    variant={activeSection === 'form' ? 'default' : 'ghost'}
                    onClick={() => {
                      setActiveSection('form');
                      setEditingBook(null);
                      setCurrentBook({
                        genre: [],
                        title: '',
                        description: '',
                        idea: '',
                        characters: [],
                        turningPoint: '',
                        uniqueFeatures: '',
                        pages: '',
                        writingStyle: [],
                        textTone: [],
                        illustrations: {
                          count: 3,
                          style: 'realistic',
                          colorScheme: 'warm',
                          mood: 'dramatic'
                        },
                        generatedImages: []
                      });
                    }}
                  >
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Создать книгу
                  </Button>
                  
                  <Button
                    variant={activeSection === 'library' ? 'default' : 'ghost'}
                    onClick={() => setActiveSection('library')}
                  >
                    <Icon name="library" className="h-4 w-4 mr-2" />
                    Библиотека
                  </Button>
                </>
              )}
              
              <Button
                variant={activeSection === 'writers' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('writers')}
              >
                <Icon name="users" className="h-4 w-4 mr-2" />
                Писатели
              </Button>
              
              <Button
                variant={activeSection === 'help' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('help')}
              >
                <Icon name="help-circle" className="h-4 w-4 mr-2" />
                Помощь
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.name}</Badge>
                  <Button variant="outline" onClick={handleLogout}>
                    <Icon name="log-out" className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setActiveSection('auth')}>
                  <Icon name="log-in" className="h-4 w-4 mr-2" />
                  Войти
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <SwanDecoration position="center">
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Создавайте книги с помощью ИИ
                </h2>
              </SwanDecoration>
              <p className="text-xl text-gray-600 mb-8">
                Ваш персональный помощник в создании уникальных литературных произведений
              </p>
              
              {user ? (
                <Button size="lg" onClick={() => setActiveSection('form')}>
                  <Icon name="sparkles" className="h-5 w-5 mr-2" />
                  Начать создание книги
                </Button>
              ) : (
                <Button size="lg" onClick={() => setActiveSection('auth')}>
                  <Icon name="log-in" className="h-5 w-5 mr-2" />
                  Войти для начала работы
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Icon name="brain" className="h-12 w-12 text-purple-600 mb-2" />
                  <CardTitle>ИИ генерация</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Мощный искусственный интеллект создаст уникальный сюжет и персонажей для вашей книги
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="image" className="h-12 w-12 text-pink-600 mb-2" />
                  <CardTitle>Иллюстрации</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Автоматическая генерация иллюстраций в выбранном стиле для вашей книги
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="download" className="h-12 w-12 text-blue-600 mb-2" />
                  <CardTitle>Экспорт</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Скачайте готовую книгу в различных форматах для печати или чтения
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeSection === 'form' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{editingBook ? 'Редактирование книги' : 'Создание новой книги'}</CardTitle>
              <CardDescription>
                {editingBook ? 'Внесите изменения и пересоздайте книгу' : 'Заполните информацию для генерации вашей книги'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={formStep} onValueChange={(v) => setFormStep(v as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Основное</TabsTrigger>
                  <TabsTrigger value="characters">Персонажи</TabsTrigger>
                  <TabsTrigger value="illustrations">Иллюстрации</TabsTrigger>
                  <TabsTrigger value="settings">Настройки</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label>Жанры (выберите до 3)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {GENRES.map((genre) => (
                        <div key={genre} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genre-${genre}`}
                            checked={currentBook.genre.includes(genre)}
                            onCheckedChange={() => handleGenreToggle(genre)}
                          />
                          <label
                            htmlFor={`genre-${genre}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {genre}
                          </label>
                        </div>
                      ))}
                    </div>
                    {currentBook.genre.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentBook.genre.map(g => (
                          <Badge key={g} variant="secondary">{g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">Название книги *</Label>
                    <Input
                      id="title"
                      value={currentBook.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Введите название..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={currentBook.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Краткое описание книги..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="idea">Основная идея *</Label>
                    <Textarea
                      id="idea"
                      value={currentBook.idea}
                      onChange={(e) => handleInputChange('idea', e.target.value)}
                      placeholder="Опишите главную идею или концепцию книги..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="turningPoint">Поворотный момент</Label>
                    <Textarea
                      id="turningPoint"
                      value={currentBook.turningPoint}
                      onChange={(e) => handleInputChange('turningPoint', e.target.value)}
                      placeholder="Ключевой момент, меняющий ход сюжета..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="uniqueFeatures">Уникальные особенности</Label>
                    <Textarea
                      id="uniqueFeatures"
                      value={currentBook.uniqueFeatures}
                      onChange={(e) => handleInputChange('uniqueFeatures', e.target.value)}
                      placeholder="Что делает вашу книгу особенной..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pages">Количество страниц</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={currentBook.pages}
                      onChange={(e) => handleInputChange('pages', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="characters" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Персонажи книги</h3>
                    <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Icon name="plus" className="h-4 w-4 mr-2" />
                          Добавить персонажа
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingCharacter ? 'Редактировать персонажа' : 'Добавить персонажа'}
                          </DialogTitle>
                          <DialogDescription>
                            Заполните информацию о персонаже вашей книги
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="char-name">Имя *</Label>
                            <Input
                              id="char-name"
                              value={currentCharacter.name}
                              onChange={(e) => handleCharacterChange('name', e.target.value)}
                              placeholder="Имя персонажа"
                            />
                          </div>

                          <div>
                            <Label htmlFor="char-age">Возраст</Label>
                            <Input
                              id="char-age"
                              value={currentCharacter.age}
                              onChange={(e) => handleCharacterChange('age', e.target.value)}
                              placeholder="25 лет"
                            />
                          </div>

                          <div>
                            <Label htmlFor="char-role">Роль</Label>
                            <Select
                              value={currentCharacter.role}
                              onValueChange={(v) => handleCharacterChange('role', v as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="main">Главный герой</SelectItem>
                                <SelectItem value="secondary">Второстепенный</SelectItem>
                                <SelectItem value="villain">Антагонист</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="char-appearance">Внешность</Label>
                            <Textarea
                              id="char-appearance"
                              value={currentCharacter.appearance}
                              onChange={(e) => handleCharacterChange('appearance', e.target.value)}
                              placeholder="Описание внешности..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="char-personality">Характер</Label>
                            <Textarea
                              id="char-personality"
                              value={currentCharacter.personality}
                              onChange={(e) => handleCharacterChange('personality', e.target.value)}
                              placeholder="Черты характера, особенности..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="char-background">Предыстория</Label>
                            <Textarea
                              id="char-background"
                              value={currentCharacter.background}
                              onChange={(e) => handleCharacterChange('background', e.target.value)}
                              placeholder="История персонажа до начала книги..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="char-motivation">Мотивация</Label>
                            <Textarea
                              id="char-motivation"
                              value={currentCharacter.motivation}
                              onChange={(e) => handleCharacterChange('motivation', e.target.value)}
                              placeholder="Что движет персонажем..."
                              rows={3}
                            />
                          </div>

                          <Button onClick={addCharacter} className="w-full">
                            {editingCharacter ? 'Сохранить изменения' : 'Добавить персонажа'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {currentBook.characters.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-gray-500">
                        <Icon name="users" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Персонажи еще не добавлены</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {currentBook.characters.map((character) => (
                        <Card key={character.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{character.name}</CardTitle>
                                <CardDescription>
                                  {character.age && `${character.age} • `}
                                  {character.role === 'main' && 'Главный герой'}
                                  {character.role === 'secondary' && 'Второстепенный'}
                                  {character.role === 'villain' && 'Антагонист'}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => editCharacter(character)}
                                >
                                  <Icon name="pencil" className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteCharacter(character.id)}
                                >
                                  <Icon name="trash-2" className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {(character.appearance || character.personality || character.background || character.motivation) && (
                            <CardContent className="space-y-2">
                              {character.appearance && (
                                <div>
                                  <p className="text-sm font-semibold">Внешность:</p>
                                  <p className="text-sm text-gray-600">{character.appearance}</p>
                                </div>
                              )}
                              {character.personality && (
                                <div>
                                  <p className="text-sm font-semibold">Характер:</p>
                                  <p className="text-sm text-gray-600">{character.personality}</p>
                                </div>
                              )}
                              {character.background && (
                                <div>
                                  <p className="text-sm font-semibold">Предыстория:</p>
                                  <p className="text-sm text-gray-600">{character.background}</p>
                                </div>
                              )}
                              {character.motivation && (
                                <div>
                                  <p className="text-sm font-semibold">Мотивация:</p>
                                  <p className="text-sm text-gray-600">{character.motivation}</p>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="illustrations" className="space-y-4">
                  <div>
                    <Label>Количество иллюстраций: {currentBook.illustrations.count}</Label>
                    <Slider
                      value={[currentBook.illustrations.count]}
                      onValueChange={([value]) => handleInputChange('illustrations', {
                        ...currentBook.illustrations,
                        count: value
                      })}
                      min={0}
                      max={25}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Стиль иллюстраций</Label>
                    <Select
                      value={currentBook.illustrations.style}
                      onValueChange={(v) => handleInputChange('illustrations', {
                        ...currentBook.illustrations,
                        style: v
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Реалистичный</SelectItem>
                        <SelectItem value="cartoon">Мультяшный</SelectItem>
                        <SelectItem value="watercolor">Акварель</SelectItem>
                        <SelectItem value="oil">Масло</SelectItem>
                        <SelectItem value="pencil">Карандаш</SelectItem>
                        <SelectItem value="digital">Цифровой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Цветовая схема</Label>
                    <Select
                      value={currentBook.illustrations.colorScheme}
                      onValueChange={(v) => handleInputChange('illustrations', {
                        ...currentBook.illustrations,
                        colorScheme: v
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm">Теплая</SelectItem>
                        <SelectItem value="cool">Холодная</SelectItem>
                        <SelectItem value="monochrome">Монохром</SelectItem>
                        <SelectItem value="vibrant">Яркая</SelectItem>
                        <SelectItem value="pastel">Пастель</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Настроение</Label>
                    <Select
                      value={currentBook.illustrations.mood}
                      onValueChange={(v) => handleInputChange('illustrations', {
                        ...currentBook.illustrations,
                        mood: v
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dramatic">Драматичное</SelectItem>
                        <SelectItem value="peaceful">Умиротворенное</SelectItem>
                        <SelectItem value="mysterious">Таинственное</SelectItem>
                        <SelectItem value="joyful">Радостное</SelectItem>
                        <SelectItem value="melancholic">Меланхоличное</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={generateIllustrations}
                    disabled={isGeneratingImages || currentBook.illustrations.count === 0}
                    className="w-full"
                  >
                    {isGeneratingImages ? (
                      <>
                        <Icon name="loader-2" className="h-4 w-4 mr-2 animate-spin" />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Icon name="image" className="h-4 w-4 mr-2" />
                        Сгенерировать иллюстрации
                      </>
                    )}
                  </Button>

                  {currentBook.generatedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {currentBook.generatedImages.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Иллюстрация ${idx + 1}`}
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label>Стиль письма (выберите до 3)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {WRITING_STYLES.map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <Checkbox
                            id={`style-${style}`}
                            checked={currentBook.writingStyle.includes(style)}
                            onCheckedChange={() => handleWritingStyleToggle(style)}
                          />
                          <label
                            htmlFor={`style-${style}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {style}
                          </label>
                        </div>
                      ))}
                    </div>
                    {currentBook.writingStyle.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentBook.writingStyle.map(s => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Тон текста (выберите до 3)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {TEXT_TONES.map((tone) => (
                        <div key={tone} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tone-${tone}`}
                            checked={currentBook.textTone.includes(tone)}
                            onCheckedChange={() => handleTextToneToggle(tone)}
                          />
                          <label
                            htmlFor={`tone-${tone}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {tone}
                          </label>
                        </div>
                      ))}
                    </div>
                    {currentBook.textTone.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentBook.textTone.map(t => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-6">
                <Button
                  onClick={generateBook}
                  disabled={isGeneratingBook}
                  className="flex-1"
                  size="lg"
                >
                  {isGeneratingBook ? (
                    <>
                      <Icon name="loader-2" className="h-5 w-5 mr-2 animate-spin" />
                      Генерация книги...
                    </>
                  ) : (
                    <>
                      <Icon name="sparkles" className="h-5 w-5 mr-2" />
                      {editingBook ? 'Обновить книгу' : 'Сгенерировать книгу'}
                    </>
                  )}
                </Button>
                {editingBook && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingBook(null);
                      setCurrentBook({
                        genre: [],
                        title: '',
                        description: '',
                        idea: '',
                        characters: [],
                        turningPoint: '',
                        uniqueFeatures: '',
                        pages: '',
                        writingStyle: [],
                        textTone: [],
                        illustrations: {
                          count: 3,
                          style: 'realistic',
                          colorScheme: 'warm',
                          mood: 'dramatic'
                        },
                        generatedImages: []
                      });
                      setActiveSection('library');
                    }}
                  >
                    Отменить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'library' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Моя библиотека</h2>
            
            {books.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="book-open" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl text-gray-500 mb-4">Ваша библиотека пуста</p>
                  <Button onClick={() => setActiveSection('form')}>
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Создать первую книгу
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <Card key={book.id} className="overflow-hidden">
                    {book.generatedImages.length > 0 && (
                      <img
                        src={book.generatedImages[0]}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
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
                      <p className="text-sm text-gray-600 mb-4">{book.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">
                          <Icon name="users" className="h-3 w-3 mr-1" />
                          {book.characters.length} персонажей
                        </Badge>
                        <Badge variant="outline">
                          <Icon name="image" className="h-3 w-3 mr-1" />
                          {book.generatedImages.length} иллюстраций
                        </Badge>
                        {book.chapters && (
                          <Badge variant="outline">
                            <Icon name="book" className="h-3 w-3 mr-1" />
                            {book.chapters.length} глав
                          </Badge>
                        )}
                      </div>

                      {book.chapters && book.chapters.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <Label className="text-sm font-semibold">Главы:</Label>
                          {book.chapters.map((chapter, idx) => (
                            <div key={idx} className="space-y-2">
                              <Label className="text-xs font-medium">{chapter.title}</Label>
                              <Textarea
                                value={chapter.text}
                                onChange={(e) => handleChapterEdit(book.id, idx, e.target.value)}
                                rows={4}
                                className="text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditBook(book)}
                        >
                          <Icon name="pencil" className="h-3 w-3 mr-1" />
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Удалить эту книгу?')) {
                              deleteBook(book.id);
                            }
                          }}
                        >
                          <Icon name="trash-2" className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'writers' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Великие писатели мира</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {worldWriters.map((writer) => (
                <Card key={writer.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">{writer.nameRu}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <p className="text-sm">{writer.name}</p>
                        <p className="text-sm font-semibold">{writer.countryRu} • {writer.years}</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{writer.description}</p>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Известные произведения:</p>
                      <div className="flex flex-wrap gap-1">
                        {writer.famousWorks.map((work, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {work}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm italic text-gray-600">"{writer.quote}"</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'help' && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Помощь и FAQ</CardTitle>
              <CardDescription>Ответы на часто задаваемые вопросы</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="create-book">
                  <AccordionTrigger>Как создать книгу?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>1. Войдите в свой аккаунт или зарегистрируйтесь</p>
                      <p>2. Нажмите кнопку "Создать книгу" в меню</p>
                      <p>3. Заполните основную информацию: выберите жанры (до 3), придумайте название и опишите основную идею</p>
                      <p>4. Добавьте персонажей с их характеристиками</p>
                      <p>5. Настройте параметры иллюстраций и сгенерируйте их (до 25 штук)</p>
                      <p>6. Выберите стиль письма и тон текста (до 3 каждого)</p>
                      <p>7. Нажмите "Сгенерировать книгу" и дождитесь завершения</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="login">
                  <AccordionTrigger>Как войти в аккаунт?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Для входа:</strong></p>
                      <p>1. Нажмите кнопку "Войти" в правом верхнем углу</p>
                      <p>2. Введите свой email и пароль</p>
                      <p>3. Нажмите "Войти"</p>
                      
                      <p className="pt-3"><strong>Для регистрации:</strong></p>
                      <p>1. На странице входа переключитесь на "Регистрация"</p>
                      <p>2. Введите имя, email и придумайте надежный пароль</p>
                      <p>3. Нажмите "Зарегистрироваться"</p>
                      <p>4. После регистрации вы автоматически войдете в систему</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="generation-issues">
                  <AccordionTrigger>Проблемы с генерацией</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Если книга не генерируется:</strong></p>
                      <p>• Убедитесь, что заполнены все обязательные поля (жанр, название, идея)</p>
                      <p>• Проверьте стабильность интернет-соединения</p>
                      <p>• Попробуйте сократить описание или упростить запрос</p>
                      <p>• Перезагрузите страницу и попробуйте снова</p>
                      
                      <p className="pt-3"><strong>Если иллюстрации не создаются:</strong></p>
                      <p>• Уменьшите количество иллюстраций (начните с 3-5)</p>
                      <p>• Подождите несколько минут между попытками</p>
                      <p>• Проверьте, что название книги и жанр указаны корректно</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="edit-book">
                  <AccordionTrigger>Как редактировать книгу?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>1. Перейдите в раздел "Библиотека"</p>
                      <p>2. Найдите нужную книгу и нажмите кнопку "Редактировать"</p>
                      <p>3. Все данные книги загрузятся в форму создания</p>
                      <p>4. Внесите необходимые изменения в любую секцию</p>
                      <p>5. Можете изменить жанры, персонажей, стиль или добавить иллюстрации</p>
                      <p>6. Нажмите "Обновить книгу" для пересоздания с новыми параметрами</p>
                      <p>7. Главы можно редактировать прямо в библиотеке через текстовые поля</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technical">
                  <AccordionTrigger>Технические проблемы</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Рекомендуемые браузеры:</strong></p>
                      <p>• Google Chrome (последняя версия)</p>
                      <p>• Mozilla Firefox (последняя версия)</p>
                      <p>• Safari (последняя версия)</p>
                      <p>• Microsoft Edge (последняя версия)</p>
                      
                      <p className="pt-3"><strong>Если что-то не работает:</strong></p>
                      <p>1. Очистите кэш браузера (Ctrl+Shift+Delete)</p>
                      <p>2. Проверьте подключение к интернету</p>
                      <p>3. Обновите страницу (F5 или Cmd+R)</p>
                      <p>4. Попробуйте войти заново</p>
                      <p>5. Убедитесь, что JavaScript включен в настройках браузера</p>
                      <p>6. Отключите блокировщики рекламы для этого сайта</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {activeSection === 'auth' && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{authMode === 'login' ? 'Вход' : 'Регистрация'}</CardTitle>
              <CardDescription>
                {authMode === 'login' 
                  ? 'Войдите в свой аккаунт' 
                  : 'Создайте новый аккаунт'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <Label htmlFor="auth-name">Имя</Label>
                  <Input
                    id="auth-name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ваше имя"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="auth-password">Пароль</Label>
                <Input
                  id="auth-password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>

              <Button onClick={handleAuth} className="w-full">
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                >
                  {authMode === 'login' 
                    ? 'Нет аккаунта? Зарегистрироваться' 
                    : 'Уже есть аккаунт? Войти'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <InteractiveAvatar />
      </main>
    </div>
  );
};

export default Index;