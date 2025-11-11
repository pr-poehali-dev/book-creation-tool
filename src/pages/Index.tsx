import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth, booksApi, User } from '@/lib/auth';
import InteractiveAvatar from '@/components/InteractiveAvatar';
import Navigation from '@/components/sections/Navigation';
import BookForm from '@/components/sections/BookForm';
import LibrarySection from '@/components/sections/LibrarySection';
import { HomeSection, AuthSection, WritersSection, HelpSection } from '@/components/sections/StaticSections';

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

const Index = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'form' | 'library' | 'help' | 'auth' | 'writers'>('home');
  const [formStep, setFormStep] = useState<'basic' | 'characters' | 'illustrations' | 'settings'>('basic');
  const [books, setBooks] = useState<Array<BookData & { id: string }>>([]);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingBook, setIsGeneratingBook] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ text: '', images: 0, total: 0 });
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

  const handleNewBook = () => {
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

        const response = await fetch('https://functions.poehali.dev/8342cb64-c8b1-46f4-8730-6216bd5465fd', {
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
    setGenerationProgress({ text: '', images: 0, total: currentBook.illustrations.count });
    
    try {
      toast.info('🚀 Начинаем генерацию книги и иллюстраций параллельно...');

      const generateImagesTask = async () => {
        if (currentBook.generatedImages.length > 0) {
          setGenerationProgress(prev => ({ ...prev, images: currentBook.generatedImages.length }));
          return currentBook.generatedImages;
        }

        const count = currentBook.illustrations.count;
        const generatedUrls: string[] = [];

        for (let i = 0; i < count; i++) {
          const prompt = `Book illustration for "${currentBook.title}": ${currentBook.description}. Style: ${currentBook.illustrations.style}, Color scheme: ${currentBook.illustrations.colorScheme}, Mood: ${currentBook.illustrations.mood}. High quality, professional book cover art.`;

          try {
            const response = await fetch('https://functions.poehali.dev/8342cb64-c8b1-46f4-8730-6216bd5465fd', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Ошибка генерации иллюстрации ${i + 1}:`, errorText);
              throw new Error(`Ошибка генерации иллюстрации ${i + 1}: ${response.status}`);
            }
            
            const data = await response.json();
            generatedUrls.push(data.url);
            setGenerationProgress(prev => ({ ...prev, images: i + 1 }));
            toast.success(`✅ Иллюстрация ${i + 1} из ${count} готова!`);
          } catch (error: any) {
            console.error(`Ошибка при генерации иллюстрации ${i + 1}:`, error);
            toast.error(`Ошибка иллюстрации ${i + 1}: ${error.message}`);
            throw error;
          }
        }

        return generatedUrls;
      };

      const generateTextTask = async () => {
        setGenerationProgress(prev => ({ ...prev, text: '⏳ Генерация текста...' }));
        toast.info('📚 Генерация текста книги...');
        
        try {
          const response = await fetch('https://functions.poehali.dev/2f50210e-c8d5-4275-968b-16b64e5f5d39', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: currentBook.title,
              genre: currentBook.genre,
              description: currentBook.description,
              idea: currentBook.idea,
              characters: currentBook.characters,
              turningPoint: currentBook.turningPoint,
              uniqueFeatures: currentBook.uniqueFeatures,
              pages: currentBook.pages,
              writingStyle: currentBook.writingStyle,
              textTone: currentBook.textTone
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка генерации текста:', errorText);
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: `HTTP ${response.status}: ${errorText}` };
            }
            throw new Error(errorData.error || errorData.details || 'Ошибка генерации текста книги');
          }

          const data = await response.json();
          setGenerationProgress(prev => ({ ...prev, text: `✅ ${data.total_chapters} глав готово!` }));
          toast.success(`✅ Текст книги сгенерирован! ${data.total_chapters} глав`);
          return data.chapters;
        } catch (error: any) {
          console.error('Ошибка при генерации текста:', error);
          setGenerationProgress(prev => ({ ...prev, text: '❌ Ошибка текста' }));
          throw error;
        }
      };

      const [images, chapters] = await Promise.all([generateImagesTask(), generateTextTask()]);

      toast.info('💾 Сохранение книги в базу данных...');

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
        illustrations: images.map((url, index) => ({
          image_url: url,
          style: currentBook.illustrations.style,
          color_scheme: currentBook.illustrations.colorScheme,
          mood: currentBook.illustrations.mood,
          order: index + 1
        })),
        chapters: chapters
      };

      if (editingBook) {
        await booksApi.updateBook(parseInt(editingBook), bookData);
        toast.success('✅ Книга обновлена!');
      } else {
        await booksApi.createBook(bookData);
        toast.success('✅ Книга создана!');
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
      console.error('Полная ошибка при создании книги:', error);
      toast.error(`❌ ${error.message || 'Ошибка при создании книги'}`);
    } finally {
      setIsGeneratingBook(false);
      setGenerationProgress({ text: '', images: 0, total: 0 });
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

  return (
    <div>
      {activeSection === 'home' && (
        <div className="min-h-screen bg-white">
          <Navigation
            activeSection={activeSection}
            user={user}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
            onNewBook={handleNewBook}
          />
          <HomeSection user={user} onNavigateToForm={() => setActiveSection('form')} />
        </div>
      )}

      {activeSection === 'form' && (
        <div className="min-h-screen bg-white">
          <Navigation
            activeSection={activeSection}
            user={user}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
            onNewBook={handleNewBook}
          />
          <BookForm
            currentBook={currentBook}
            currentCharacter={currentCharacter}
            editingBook={editingBook}
            editingCharacter={editingCharacter}
            formStep={formStep}
            isCharacterDialogOpen={isCharacterDialogOpen}
            isGeneratingImages={isGeneratingImages}
            isGeneratingBook={isGeneratingBook}
            generationProgress={generationProgress}
            onInputChange={handleInputChange}
            onCharacterChange={handleCharacterChange}
            onGenreToggle={handleGenreToggle}
            onWritingStyleToggle={handleWritingStyleToggle}
            onTextToneToggle={handleTextToneToggle}
            onAddCharacter={addCharacter}
            onEditCharacter={editCharacter}
            onDeleteCharacter={deleteCharacter}
            onGenerateImages={generateImages}
            onGenerateBook={generateBook}
            setFormStep={setFormStep}
            setIsCharacterDialogOpen={setIsCharacterDialogOpen}
            setEditingCharacter={setEditingCharacter}
            setCurrentCharacter={setCurrentCharacter}
          />
        </div>
      )}

      {activeSection === 'library' && (
        <div className="min-h-screen bg-white">
          <Navigation
            activeSection={activeSection}
            user={user}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
            onNewBook={handleNewBook}
          />
          <LibrarySection
            books={books}
            onEditBook={startEditingBook}
            onDeleteBook={deleteBook}
            onCreateNew={() => setActiveSection('form')}
          />
        </div>
      )}

      {activeSection === 'help' && (
        <div className="min-h-screen bg-white">
          <Navigation
            activeSection={activeSection}
            user={user}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
            onNewBook={handleNewBook}
          />
          <HelpSection />
        </div>
      )}

      {activeSection === 'auth' && (
        <div className="min-h-screen bg-white">
          <Navigation
            activeSection={activeSection}
            user={user}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
            onNewBook={handleNewBook}
          />
          <AuthSection
            authMode={authMode}
            authForm={authForm}
            onAuthFormChange={setAuthForm}
            onAuthModeChange={setAuthMode}
            onSubmit={handleAuth}
          />
        </div>
      )}

      {activeSection === 'writers' && (
        <div className="min-h-screen bg-white">
          <Navigation
            activeSection={activeSection}
            user={user}
            onSectionChange={setActiveSection}
            onLogout={handleLogout}
            onNewBook={handleNewBook}
          />
          <WritersSection />
        </div>
      )}

      <InteractiveAvatar />
    </div>
  );
};

export default Index;