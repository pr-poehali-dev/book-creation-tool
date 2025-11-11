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
    if (!currentCharacter.name || !currentCharacter.age || !currentCharacter.appearance) {
      toast.error('Заполните обязательные поля персонажа');
      return;
    }

    if (editingCharacter) {
      setCurrentBook(prev => ({
        ...prev,
        characters: prev.characters.map(c =>
          c.id === editingCharacter.id
            ? { ...currentCharacter, id: editingCharacter.id }
            : c
        )
      }));
      toast.success('Персонаж обновлен');
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
    toast.success('Персонаж удален');
  };

  const generateImages = async () => {
    if (!currentBook.title || !currentBook.description) {
      toast.error('Заполните название и описание книги перед генерацией иллюстраций');
      return;
    }

    setIsGeneratingImages(true);
    try {
      const count = currentBook.illustrations.count;
      const generatedUrls: string[] = [];

      for (let i = 0; i < count; i++) {
        toast.info(`Генерация иллюстрации ${i + 1} из ${count}...`);
        
        const prompt = `Book illustration for "${currentBook.title}": ${currentBook.description}. 
        Style: ${currentBook.illustrations.style}, 
        Color scheme: ${currentBook.illustrations.colorScheme}, 
        Mood: ${currentBook.illustrations.mood}. 
        High quality, professional book cover art.`;

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (!response.ok) throw new Error('Ошибка генерации изображения');
        
        const data = await response.json();
        generatedUrls.push(data.url);
      }

      setCurrentBook(prev => ({
        ...prev,
        generatedImages: generatedUrls
      }));

      toast.success(`Сгенерировано ${count} иллюстраций!`);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при генерации иллюстраций');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const generateBook = async () => {
    if (!user) {
      toast.error('Войдите в аккаунт для создания книги');
      setActiveSection('auth');
      return;
    }

    if (!currentBook.title || !currentBook.description || !currentBook.idea || currentBook.genre.length === 0) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setIsGeneratingBook(true);
    try {
      const bookData = {
        title: currentBook.title,
        genre: currentBook.genre,
        description: currentBook.description,
        idea: currentBook.idea,
        characters: currentBook.characters,
        turning_point: currentBook.turningPoint,
        unique_features: currentBook.uniqueFeatures,
        pages: currentBook.pages,
        writing_style: currentBook.writingStyle,
        text_tone: currentBook.textTone,
        illustrations: currentBook.generatedImages.map((url, index) => ({
          image_url: url,
          style: currentBook.illustrations.style,
          color_scheme: currentBook.illustrations.colorScheme,
          mood: currentBook.illustrations.mood,
          order: index + 1
        }))
      };

      if (editingBook) {
        await booksApi.updateBook(parseInt(editingBook), bookData);
        toast.success('Книга обновлена!');
      } else {
        await booksApi.createBook(bookData);
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
      toast.error(error.message || 'Ошибка при создании книги');
    } finally {
      setIsGeneratingBook(false);
    }
  };

  const startEditingBook = (book: BookData & { id: string }) => {
    setEditingBook(book.id);
    setCurrentBook(book);
    setActiveSection('form');
    setFormStep('basic');
  };

  const deleteBook = async (id: string) => {
    try {
      await booksApi.deleteBook(parseInt(id));
      await loadBooks();
      toast.success('Книга удалена');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const renderNav = () => (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-purple-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-black tracking-wide">Генератор Книг</h1>
          <div className="flex gap-2">
            <Button
              variant={activeSection === 'home' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('home')}
              className="gap-2"
            >
              <Icon name="Home" className="w-4 h-4" />
              Главная
            </Button>
            {user && (
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
                className="gap-2"
              >
                <Icon name="Plus" className="w-4 h-4" />
                Создать
              </Button>
            )}
            {user && (
              <Button
                variant={activeSection === 'library' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('library')}
                className="gap-2"
              >
                <Icon name="Library" className="w-4 h-4" />
                Библиотека
              </Button>
            )}
            <Button
              variant={activeSection === 'writers' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('writers')}
              className="gap-2"
            >
              <Icon name="Users" className="w-4 h-4" />
              Писатели
            </Button>
            <Button
              variant={activeSection === 'help' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('help')}
              className="gap-2"
            >
              <Icon name="HelpCircle" className="w-4 h-4" />
              Помощь
            </Button>
            {!user ? (
              <Button
                variant={activeSection === 'auth' ? 'default' : 'ghost'}
                onClick={() => setActiveSection('auth')}
                className="gap-2"
              >
                <Icon name="LogIn" className="w-4 h-4" />
                Войти
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2"
              >
                <Icon name="LogOut" className="w-4 h-4" />
                Выйти
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {renderNav()}
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Создайте свою книгу с помощью ИИ
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Превратите свои идеи в полноценные литературные произведения с иллюстрациями
          </p>
          {user ? (
            <Button
              size="lg"
              onClick={() => setActiveSection('form')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
            >
              <Icon name="Plus" className="w-5 h-5 mr-2" />
              Начать создание книги
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setActiveSection('auth')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
            >
              <Icon name="LogIn" className="w-5 h-5 mr-2" />
              Войти или зарегистрироваться
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Icon name="BookOpen" className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Умная генерация</CardTitle>
              <CardDescription>
                ИИ создаст уникальный сюжет, персонажей и диалоги на основе ваших идей
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-pink-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Image" className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle>Иллюстрации</CardTitle>
              <CardDescription>
                Автоматическая генерация уникальных иллюстраций для вашей книги
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Download" className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Экспорт</CardTitle>
              <CardDescription>
                Скачайте готовую книгу в различных форматах: PDF, EPUB, DOCX
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAuthSection = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {renderNav()}
      <div className="container mx-auto px-6 py-12">
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
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Ваше имя"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <Button onClick={handleAuth} className="w-full">
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="w-full"
            >
              {authMode === 'login' 
                ? 'Нет аккаунта? Зарегистрируйтесь' 
                : 'Уже есть аккаунт? Войдите'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderWritersSection = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {renderNav()}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Великие писатели мира
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worldWriters.map((writer) => (
              <Card key={writer.id} className="bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {writer.nameRu.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{writer.nameRu}</CardTitle>
                      <p className="text-sm text-gray-600">{writer.years}</p>
                      <p className="text-sm text-gray-500">{writer.countryRu}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{writer.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Известные произведения:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {(writer.famousWorks || []).map((work, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {work}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 italic border-l-2 border-purple-300 pl-3">
                      {writer.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {renderNav()}
      
      <div className="container mx-auto px-6 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">
              {editingBook ? 'Редактировать книгу' : 'Создать новую книгу'}
            </CardTitle>
            <CardDescription>
              Заполните информацию о вашей будущей книге
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

              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название книги *</Label>
                  <Input
                    id="title"
                    value={currentBook.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Введите название"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Жанры (выберите до 3) *</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <Badge
                        key={genre}
                        variant={currentBook.genre.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Краткое описание *</Label>
                  <Textarea
                    id="description"
                    value={currentBook.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="О чем ваша книга?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idea">Основная идея книги *</Label>
                  <Textarea
                    id="idea"
                    value={currentBook.idea}
                    onChange={(e) => handleInputChange('idea', e.target.value)}
                    placeholder="Какую идею вы хотите донести?"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turningPoint">Ключевой поворот сюжета</Label>
                  <Textarea
                    id="turningPoint"
                    value={currentBook.turningPoint}
                    onChange={(e) => handleInputChange('turningPoint', e.target.value)}
                    placeholder="Главное событие, меняющее ход истории"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueFeatures">Уникальные особенности</Label>
                  <Textarea
                    id="uniqueFeatures"
                    value={currentBook.uniqueFeatures}
                    onChange={(e) => handleInputChange('uniqueFeatures', e.target.value)}
                    placeholder="Что делает вашу книгу особенной?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pages">Примерное количество страниц</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={currentBook.pages}
                    onChange={(e) => handleInputChange('pages', e.target.value)}
                    placeholder="Например: 200"
                  />
                </div>

                <Button onClick={() => setFormStep('characters')} className="w-full">
                  Далее: Персонажи
                  <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                </Button>
              </TabsContent>

              <TabsContent value="characters" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Персонажи книги</h3>
                  <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingCharacter(null);
                        setCurrentCharacter({
                          name: '',
                          age: '',
                          appearance: '',
                          personality: '',
                          background: '',
                          motivation: '',
                          role: 'main'
                        });
                      }}>
                        <Icon name="Plus" className="w-4 h-4 mr-2" />
                        Добавить персонажа
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCharacter ? 'Редактировать персонажа' : 'Новый персонаж'}
                        </DialogTitle>
                        <DialogDescription>
                          Опишите персонажа вашей книги
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="char-name">Имя *</Label>
                          <Input
                            id="char-name"
                            value={currentCharacter.name}
                            onChange={(e) => handleCharacterChange('name', e.target.value)}
                            placeholder="Имя персонажа"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="char-age">Возраст *</Label>
                          <Input
                            id="char-age"
                            value={currentCharacter.age}
                            onChange={(e) => handleCharacterChange('age', e.target.value)}
                            placeholder="Возраст или возрастная группа"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="char-role">Роль в истории</Label>
                          <Select
                            value={currentCharacter.role}
                            onValueChange={(value) => handleCharacterChange('role', value)}
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

                        <div className="space-y-2">
                          <Label htmlFor="char-appearance">Внешность *</Label>
                          <Textarea
                            id="char-appearance"
                            value={currentCharacter.appearance}
                            onChange={(e) => handleCharacterChange('appearance', e.target.value)}
                            placeholder="Опишите внешность персонажа"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="char-personality">Характер и личность</Label>
                          <Textarea
                            id="char-personality"
                            value={currentCharacter.personality}
                            onChange={(e) => handleCharacterChange('personality', e.target.value)}
                            placeholder="Черты характера, особенности поведения"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="char-background">Предыстория</Label>
                          <Textarea
                            id="char-background"
                            value={currentCharacter.background}
                            onChange={(e) => handleCharacterChange('background', e.target.value)}
                            placeholder="История жизни персонажа"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="char-motivation">Мотивация</Label>
                          <Textarea
                            id="char-motivation"
                            value={currentCharacter.motivation}
                            onChange={(e) => handleCharacterChange('motivation', e.target.value)}
                            placeholder="Что движет персонажем?"
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

                <div className="space-y-4">
                  {currentBook.characters.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Icon name="Users" className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Пока нет персонажей. Добавьте первого!</p>
                    </div>
                  ) : (
                    currentBook.characters.map(character => (
                      <Card key={character.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{character.name}</CardTitle>
                              <CardDescription>
                                {character.age} • {
                                  character.role === 'main' ? 'Главный герой' :
                                  character.role === 'villain' ? 'Антагонист' :
                                  'Второстепенный'
                                }
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editCharacter(character)}
                              >
                                <Icon name="Edit" className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCharacter(character.id)}
                              >
                                <Icon name="Trash2" className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p><strong>Внешность:</strong> {character.appearance}</p>
                            {character.personality && (
                              <p><strong>Характер:</strong> {character.personality}</p>
                            )}
                            {character.background && (
                              <p><strong>Предыстория:</strong> {character.background}</p>
                            )}
                            {character.motivation && (
                              <p><strong>Мотивация:</strong> {character.motivation}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFormStep('basic')} className="flex-1">
                    <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                  <Button onClick={() => setFormStep('illustrations')} className="flex-1">
                    Далее: Иллюстрации
                    <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="illustrations" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Количество иллюстраций: {currentBook.illustrations.count}</Label>
                    <Slider
                      value={[currentBook.illustrations.count]}
                      onValueChange={(values) =>
                        handleInputChange('illustrations', {
                          ...currentBook.illustrations,
                          count: values[0]
                        })
                      }
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ill-style">Стиль иллюстраций</Label>
                    <Select
                      value={currentBook.illustrations.style}
                      onValueChange={(value) =>
                        handleInputChange('illustrations', {
                          ...currentBook.illustrations,
                          style: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Реалистичный</SelectItem>
                        <SelectItem value="watercolor">Акварель</SelectItem>
                        <SelectItem value="digital">Цифровой</SelectItem>
                        <SelectItem value="pencil">Карандашный</SelectItem>
                        <SelectItem value="oil">Масляная живопись</SelectItem>
                        <SelectItem value="anime">Аниме</SelectItem>
                        <SelectItem value="comic">Комикс</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ill-colors">Цветовая схема</Label>
                    <Select
                      value={currentBook.illustrations.colorScheme}
                      onValueChange={(value) =>
                        handleInputChange('illustrations', {
                          ...currentBook.illustrations,
                          colorScheme: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm">Теплая</SelectItem>
                        <SelectItem value="cold">Холодная</SelectItem>
                        <SelectItem value="monochrome">Монохромная</SelectItem>
                        <SelectItem value="vibrant">Яркая</SelectItem>
                        <SelectItem value="pastel">Пастельная</SelectItem>
                        <SelectItem value="dark">Темная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ill-mood">Настроение</Label>
                    <Select
                      value={currentBook.illustrations.mood}
                      onValueChange={(value) =>
                        handleInputChange('illustrations', {
                          ...currentBook.illustrations,
                          mood: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dramatic">Драматичное</SelectItem>
                        <SelectItem value="peaceful">Спокойное</SelectItem>
                        <SelectItem value="mysterious">Загадочное</SelectItem>
                        <SelectItem value="joyful">Радостное</SelectItem>
                        <SelectItem value="melancholic">Меланхоличное</SelectItem>
                        <SelectItem value="epic">Эпичное</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={generateImages}
                    disabled={isGeneratingImages}
                    className="w-full"
                  >
                    {isGeneratingImages ? (
                      <>
                        <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Icon name="Image" className="w-4 h-4 mr-2" />
                        Сгенерировать иллюстрации
                      </>
                    )}
                  </Button>
                </div>

                {currentBook.generatedImages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Сгенерированные иллюстрации:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {currentBook.generatedImages.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Иллюстрация ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const newImages = currentBook.generatedImages.filter((_, i) => i !== idx);
                                handleInputChange('generatedImages', newImages);
                              }}
                            >
                              <Icon name="Trash2" className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFormStep('characters')} className="flex-1">
                    <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                  <Button onClick={() => setFormStep('settings')} className="flex-1">
                    Далее: Настройки
                    <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-2">
                  <Label>Стиль написания (до 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {WRITING_STYLES.map(style => (
                      <Badge
                        key={style}
                        variant={currentBook.writingStyle.includes(style) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleWritingStyleToggle(style)}
                      >
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Тон текста (до 3)</Label>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_TONES.map(tone => (
                      <Badge
                        key={tone}
                        variant={currentBook.textTone.includes(tone) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleTextToneToggle(tone)}
                      >
                        {tone}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFormStep('illustrations')} className="flex-1">
                    <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                  <Button
                    onClick={generateBook}
                    disabled={isGeneratingBook}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGeneratingBook ? (
                      <>
                        <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Создание книги...
                      </>
                    ) : (
                      <>
                        <Icon name="BookOpen" className="w-4 h-4 mr-2" />
                        {editingBook ? 'Сохранить изменения' : 'Создать книгу'}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {renderNav()}
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Моя библиотека
          </h2>

          {books.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Icon name="BookOpen" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">У вас пока нет созданных книг</p>
                <Button onClick={() => setActiveSection('form')}>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingBook(book)}
                        className="flex-1"
                      >
                        <Icon name="Edit" className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBook(book.id)}
                        className="flex-1"
                      >
                        <Icon name="Trash2" className="w-4 h-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                    {book.chapters && book.chapters.length > 0 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        <Icon name="Download" className="w-4 h-4 mr-2" />
                        Скачать ({book.chapters.length} глав)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {renderNav()}
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Помощь и FAQ
          </h2>

          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Icon name="BookOpen" className="w-5 h-5 text-purple-600" />
                      <span>Как создать книгу?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-gray-700">
                      <p>1. Войдите в свой аккаунт или зарегистрируйтесь</p>
                      <p>2. Нажмите кнопку "Создать" в навигационном меню</p>
                      <p>3. Заполните основную информацию: название, жанр, описание и идею книги</p>
                      <p>4. Добавьте персонажей с их характеристиками</p>
                      <p>5. Настройте параметры иллюстраций и сгенерируйте их</p>
                      <p>6. Выберите стиль написания и тон текста</p>
                      <p>7. Нажмите "Создать книгу" - ИИ сгенерирует вашу книгу!</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Icon name="User" className="w-5 h-5 text-purple-600" />
                      <span>Как войти в аккаунт?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-gray-700">
                      <p>Для входа в аккаунт:</p>
                      <p>1. Нажмите кнопку "Войти" в правом верхнем углу</p>
                      <p>2. Введите свой email и пароль</p>
                      <p>3. Нажмите "Войти"</p>
                      <p className="mt-4">Если у вас нет аккаунта:</p>
                      <p>1. Нажмите "Нет аккаунта? Зарегистрируйтесь"</p>
                      <p>2. Введите имя, email и пароль</p>
                      <p>3. Нажмите "Зарегистрироваться"</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Icon name="Image" className="w-5 h-5 text-purple-600" />
                      <span>Проблемы с генерацией?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Иллюстрации не генерируются:</strong></p>
                      <p>- Убедитесь, что заполнены название и описание книги</p>
                      <p>- Проверьте интернет-соединение</p>
                      <p>- Попробуйте изменить настройки стиля или цветовой схемы</p>
                      <p className="mt-4"><strong>Книга не создается:</strong></p>
                      <p>- Проверьте, что заполнены все обязательные поля (отмечены *)</p>
                      <p>- Убедитесь, что выбран хотя бы один жанр</p>
                      <p>- Добавьте хотя бы одного персонажа для лучшего результата</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Icon name="Edit" className="w-5 h-5 text-purple-600" />
                      <span>Как редактировать книгу?</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-gray-700">
                      <p>1. Перейдите в раздел "Библиотека"</p>
                      <p>2. Найдите нужную книгу</p>
                      <p>3. Нажмите кнопку "Редактировать"</p>
                      <p>4. Внесите необходимые изменения</p>
                      <p>5. Нажмите "Сохранить изменения"</p>
                      <p className="mt-4">Вы можете изменить любые параметры книги, добавить или удалить персонажей, перегенерировать иллюстрации.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Icon name="Settings" className="w-5 h-5 text-purple-600" />
                      <span>Технические проблемы</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Страница не загружается:</strong></p>
                      <p>- Обновите страницу (F5 или Ctrl+R)</p>
                      <p>- Очистите кэш браузера</p>
                      <p>- Попробуйте другой браузер</p>
                      <p className="mt-4"><strong>Ошибка аутентификации:</strong></p>
                      <p>- Проверьте правильность email и пароля</p>
                      <p>- Убедитесь, что аккаунт активирован</p>
                      <p>- Попробуйте выйти и войти снова</p>
                      <p className="mt-4"><strong>Другие проблемы:</strong></p>
                      <p>Если проблема сохраняется, попробуйте перезагрузить страницу или обратитесь в службу поддержки.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Нужна дополнительная помощь?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Если вы не нашли ответ на свой вопрос, свяжитесь с нами:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Icon name="Mail" className="w-5 h-5 text-purple-600" />
                  <span>support@bookgen.ai</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Icon name="MessageCircle" className="w-5 h-5 text-purple-600" />
                  <span>Онлайн-чат (доступен 24/7)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activeSection === 'home' && renderHome()}
      {activeSection === 'form' && renderForm()}
      {activeSection === 'library' && renderLibrary()}
      {activeSection === 'help' && renderHelp()}
      {activeSection === 'auth' && renderAuthSection()}
      {activeSection === 'writers' && renderWritersSection()}
    </div>
  );
};

export default Index;