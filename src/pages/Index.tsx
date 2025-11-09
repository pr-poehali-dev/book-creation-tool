import { useState } from 'react';
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
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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

type BookData = {
  genre: string;
  title: string;
  description: string;
  idea: string;
  characters: Character[];
  turningPoint: string;
  uniqueFeatures: string;
  pages: string;
  writingStyle: string;
  textTone: string;
  illustrations: IllustrationSettings;
  generatedImages: string[];
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'form' | 'library' | 'help'>('home');
  const [formStep, setFormStep] = useState<'basic' | 'characters' | 'illustrations' | 'settings'>('basic');
  const [books, setBooks] = useState<Array<BookData & { id: string }>>([]);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  
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
    genre: '',
    title: '',
    description: '',
    idea: '',
    characters: [],
    turningPoint: '',
    uniqueFeatures: '',
    pages: '',
    writingStyle: '',
    textTone: '',
    illustrations: {
      count: 3,
      style: 'realistic',
      colorScheme: 'warm',
      mood: 'dramatic'
    },
    generatedImages: []
  });

  const handleInputChange = (field: keyof BookData, value: any) => {
    setCurrentBook(prev => ({ ...prev, [field]: value }));
  };

  const handleCharacterChange = (field: keyof Omit<Character, 'id'>, value: string) => {
    setCurrentCharacter(prev => ({ ...prev, [field]: value }));
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

  const generateIllustrations = async () => {
    setIsGeneratingImages(true);
    toast.info(`Генерирую ${currentBook.illustrations.count} иллюстраций...`);
    
    const images: string[] = [];
    
    for (let i = 0; i < currentBook.illustrations.count; i++) {
      try {
        const prompt = `Book illustration for "${currentBook.title}", ${currentBook.genre} genre, ${currentBook.illustrations.style} art style, ${currentBook.illustrations.colorScheme} color palette, ${currentBook.illustrations.mood} mood, scene ${i + 1} of ${currentBook.illustrations.count}, professional book cover quality`;
        
        const response = await fetch('https://poehali.dev/.api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        if (data.url) {
          images.push(data.url);
          toast.success(`Иллюстрация ${i + 1}/${currentBook.illustrations.count} готова`);
        }
      } catch (error) {
        console.error('Error generating image:', error);
        toast.error(`Ошибка при создании иллюстрации ${i + 1}`);
      }
    }
    
    setCurrentBook(prev => ({ ...prev, generatedImages: images }));
    setIsGeneratingImages(false);
    toast.success('Все иллюстрации созданы!');
  };

  const handleNextStep = () => {
    if (formStep === 'basic') {
      if (!currentBook.title || !currentBook.genre) {
        toast.error('Заполните обязательные поля');
        return;
      }
      setFormStep('characters');
    } else if (formStep === 'characters') {
      if (currentBook.characters.length === 0) {
        toast.error('Добавьте хотя бы одного персонажа');
        return;
      }
      setFormStep('illustrations');
    } else if (formStep === 'illustrations') {
      setFormStep('settings');
    } else {
      const newBook = { ...currentBook, id: Date.now().toString() };
      setBooks(prev => [...prev, newBook]);
      toast.success('Книга создана!');
      setActiveSection('library');
      setFormStep('basic');
      setCurrentBook({
        genre: '',
        title: '',
        description: '',
        idea: '',
        characters: [],
        turningPoint: '',
        uniqueFeatures: '',
        pages: '',
        writingStyle: '',
        textTone: '',
        illustrations: {
          count: 3,
          style: 'realistic',
          colorScheme: 'warm',
          mood: 'dramatic'
        },
        generatedImages: []
      });
    }
  };

  const downloadBook = (book: BookData & { id: string }) => {
    let content = `${book.title}\n${'='.repeat(book.title.length)}\n\n`;
    content += `Жанр: ${book.genre}\n`;
    content += `Стиль: ${book.writingStyle}\n`;
    content += `Тон: ${book.textTone}\n\n`;
    content += `${book.description}\n\n`;
    content += `ГЛАВНАЯ ИДЕЯ\n${book.idea}\n\n`;
    content += `ПЕРСОНАЖИ\n`;
    book.characters.forEach(char => {
      content += `\n${char.name} (${char.role})\n`;
      content += `Возраст: ${char.age}\n`;
      content += `Внешность: ${char.appearance}\n`;
      content += `Характер: ${char.personality}\n`;
      content += `Предыстория: ${char.background}\n`;
      content += `Мотивация: ${char.motivation}\n`;
    });
    content += `\n\nПОВОРОТНЫЙ МОМЕНТ\n${book.turningPoint}\n\n`;
    content += `УНИКАЛЬНЫЕ ФИШКИ\n${book.uniqueFeatures}\n\n`;
    
    if (book.generatedImages.length > 0) {
      content += `\nИЛЛЮСТРАЦИИ:\n`;
      book.generatedImages.forEach((url, idx) => {
        content += `${idx + 1}. ${url}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.replace(/[^a-zа-яё0-9]/gi, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Книга скачана!');
  };

  const renderNavigation = () => (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Литературная Мастерская</h1>
          <div className="flex gap-6">
            {[
              { id: 'home', label: 'Главная', icon: 'Home' },
              { id: 'form', label: 'Создать книгу', icon: 'BookPlus' },
              { id: 'library', label: 'Библиотека', icon: 'Library' },
              { id: 'help', label: 'Помощь', icon: 'HelpCircle' }
            ].map(item => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                onClick={() => setActiveSection(item.id as any)}
                className="gap-2"
              >
                <Icon name={item.icon as any} size={18} />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="animate-fade-in">
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-6xl font-bold mb-6 leading-tight">
            Создайте свою книгу с помощью ИИ
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Заполните анкету, создайте детальных персонажей, сгенерируйте иллюстрации — 
            получите готовую книгу для скачивания
          </p>
          <Button 
            size="lg" 
            onClick={() => setActiveSection('form')}
            className="gap-2 text-lg px-8 py-6"
          >
            <Icon name="PenTool" size={20} />
            Начать писать
          </Button>
        </div>
      </section>

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl font-bold text-center mb-12">Как это работает</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: 'FileText',
                title: 'Опишите книгу',
                description: 'Жанр, сюжет, идея и уникальные особенности'
              },
              {
                icon: 'Users',
                title: 'Создайте персонажей',
                description: 'Детальные анкеты героев с характером и мотивацией'
              },
              {
                icon: 'Image',
                title: 'Сгенерируйте иллюстрации',
                description: 'ИИ создаст иллюстрации в выбранном стиле'
              },
              {
                icon: 'Download',
                title: 'Скачайте книгу',
                description: 'Получите готовый файл с текстом и картинками'
              }
            ].map((step, idx) => (
              <Card key={idx} className="animate-scale-in hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                    <Icon name={step.icon as any} size={28} className="text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderCharacterDialog = () => (
    <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingCharacter ? 'Редактировать персонажа' : 'Добавить персонажа'}
          </DialogTitle>
          <DialogDescription>
            Заполните детальную анкету для создания живого персонажа
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Имя персонажа *</Label>
              <Input 
                value={currentCharacter.name}
                onChange={(e) => handleCharacterChange('name', e.target.value)}
                placeholder="Иван Петров"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Возраст</Label>
              <Input 
                value={currentCharacter.age}
                onChange={(e) => handleCharacterChange('age', e.target.value)}
                placeholder="25 лет"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Роль в истории</Label>
            <Select 
              value={currentCharacter.role} 
              onValueChange={(val) => handleCharacterChange('role', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Главный герой</SelectItem>
                <SelectItem value="secondary">Второстепенный персонаж</SelectItem>
                <SelectItem value="villain">Антагонист/Злодей</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Внешность</Label>
            <Textarea 
              value={currentCharacter.appearance}
              onChange={(e) => handleCharacterChange('appearance', e.target.value)}
              placeholder="Высокий, светлые волосы, голубые глаза..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Характер и личность</Label>
            <Textarea 
              value={currentCharacter.personality}
              onChange={(e) => handleCharacterChange('personality', e.target.value)}
              placeholder="Смелый, но импульсивный. Любит справедливость..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Предыстория</Label>
            <Textarea 
              value={currentCharacter.background}
              onChange={(e) => handleCharacterChange('background', e.target.value)}
              placeholder="Вырос в деревне, потерял родителей в детстве..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Мотивация и цели</Label>
            <Textarea 
              value={currentCharacter.motivation}
              onChange={(e) => handleCharacterChange('motivation', e.target.value)}
              placeholder="Хочет отомстить за семью и защитить королевство..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={addCharacter} className="flex-1">
              <Icon name="Check" size={18} className="mr-2" />
              {editingCharacter ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCharacterDialogOpen(false);
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
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderForm = () => (
    <div className="py-12 px-6 animate-fade-in">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            {['basic', 'characters', 'illustrations', 'settings'].map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`h-2 w-full rounded ${
                  formStep === step ? 'bg-primary' : 
                  ['basic', 'characters', 'illustrations', 'settings'].indexOf(formStep) > idx ? 'bg-primary/50' : 'bg-muted'
                }`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Шаг {['basic', 'characters', 'illustrations', 'settings'].indexOf(formStep) + 1} из 4
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">
              {formStep === 'basic' && 'Основная информация'}
              {formStep === 'characters' && 'Персонажи'}
              {formStep === 'illustrations' && 'Иллюстрации'}
              {formStep === 'settings' && 'Настройки книги'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formStep === 'basic' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="genre">Жанр книги *</Label>
                  <Select value={currentBook.genre} onValueChange={(val) => handleInputChange('genre', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите жанр" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fantasy">Фэнтези</SelectItem>
                      <SelectItem value="scifi">Научная фантастика</SelectItem>
                      <SelectItem value="detective">Детектив</SelectItem>
                      <SelectItem value="romance">Роман</SelectItem>
                      <SelectItem value="thriller">Триллер</SelectItem>
                      <SelectItem value="drama">Драма</SelectItem>
                      <SelectItem value="historical">Исторический</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Название книги *</Label>
                  <Input 
                    id="title"
                    value={currentBook.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Введите название вашей книги"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание сюжета</Label>
                  <Textarea
                    id="description"
                    value={currentBook.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Краткое описание истории..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idea">Главная идея</Label>
                  <Textarea
                    id="idea"
                    value={currentBook.idea}
                    onChange={(e) => handleInputChange('idea', e.target.value)}
                    placeholder="Какую мысль вы хотите донести до читателя?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turningPoint">Поворотный момент</Label>
                  <Textarea
                    id="turningPoint"
                    value={currentBook.turningPoint}
                    onChange={(e) => handleInputChange('turningPoint', e.target.value)}
                    placeholder="Ключевое событие, меняющее ход истории..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueFeatures">Уникальные фишки</Label>
                  <Textarea
                    id="uniqueFeatures"
                    value={currentBook.uniqueFeatures}
                    onChange={(e) => handleInputChange('uniqueFeatures', e.target.value)}
                    placeholder="Что делает вашу книгу особенной?"
                    rows={3}
                  />
                </div>
              </>
            )}

            {formStep === 'characters' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Персонажи ({currentBook.characters.length})</h3>
                    <p className="text-sm text-muted-foreground">Создайте детальные анкеты для всех персонажей</p>
                  </div>
                  <Button onClick={() => setIsCharacterDialogOpen(true)} className="gap-2">
                    <Icon name="Plus" size={18} />
                    Добавить
                  </Button>
                </div>

                {currentBook.characters.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Icon name="Users" size={48} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Пока нет персонажей</p>
                    <Button onClick={() => setIsCharacterDialogOpen(true)} variant="outline" className="gap-2">
                      <Icon name="Plus" size={16} />
                      Создать первого персонажа
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {currentBook.characters.map(char => (
                      <Card key={char.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{char.name}</h4>
                              <Badge variant={
                                char.role === 'main' ? 'default' : 
                                char.role === 'villain' ? 'destructive' : 'secondary'
                              }>
                                {char.role === 'main' ? 'Главный' : 
                                 char.role === 'villain' ? 'Злодей' : 'Второстепенный'}
                              </Badge>
                            </div>
                            {char.age && <p className="text-sm text-muted-foreground mb-1">Возраст: {char.age}</p>}
                            {char.personality && (
                              <p className="text-sm line-clamp-2">{char.personality}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="ghost" onClick={() => editCharacter(char)}>
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteCharacter(char.id)}>
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {renderCharacterDialog()}
              </>
            )}

            {formStep === 'illustrations' && (
              <>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Количество иллюстраций: {currentBook.illustrations.count}</Label>
                    <Slider 
                      value={[currentBook.illustrations.count]}
                      onValueChange={(val) => handleInputChange('illustrations', { ...currentBook.illustrations, count: val[0] })}
                      min={1}
                      max={10}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">От 1 до 10 иллюстраций</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Стиль иллюстраций</Label>
                    <Select 
                      value={currentBook.illustrations.style} 
                      onValueChange={(val) => handleInputChange('illustrations', { ...currentBook.illustrations, style: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Реалистичный</SelectItem>
                        <SelectItem value="watercolor">Акварель</SelectItem>
                        <SelectItem value="oil-painting">Масляная живопись</SelectItem>
                        <SelectItem value="digital-art">Цифровое искусство</SelectItem>
                        <SelectItem value="sketch">Скетч/Набросок</SelectItem>
                        <SelectItem value="anime">Аниме</SelectItem>
                        <SelectItem value="comic">Комикс</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Цветовая палитра</Label>
                    <Select 
                      value={currentBook.illustrations.colorScheme} 
                      onValueChange={(val) => handleInputChange('illustrations', { ...currentBook.illustrations, colorScheme: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm">Тёплые тона</SelectItem>
                        <SelectItem value="cold">Холодные тона</SelectItem>
                        <SelectItem value="vibrant">Яркие цвета</SelectItem>
                        <SelectItem value="pastel">Пастельные</SelectItem>
                        <SelectItem value="monochrome">Монохром</SelectItem>
                        <SelectItem value="dark">Тёмные тона</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Настроение</Label>
                    <Select 
                      value={currentBook.illustrations.mood} 
                      onValueChange={(val) => handleInputChange('illustrations', { ...currentBook.illustrations, mood: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dramatic">Драматичное</SelectItem>
                        <SelectItem value="peaceful">Умиротворённое</SelectItem>
                        <SelectItem value="mysterious">Таинственное</SelectItem>
                        <SelectItem value="epic">Эпичное</SelectItem>
                        <SelectItem value="romantic">Романтичное</SelectItem>
                        <SelectItem value="dark">Мрачное</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Предпросмотр настроек:</h4>
                    <p className="text-sm">
                      Будет создано <strong>{currentBook.illustrations.count}</strong> иллюстраций 
                      в стиле <strong>{currentBook.illustrations.style}</strong> с{' '}
                      <strong>{currentBook.illustrations.colorScheme}</strong> палитрой и{' '}
                      <strong>{currentBook.illustrations.mood}</strong> настроением
                    </p>
                  </div>

                  <Button 
                    onClick={generateIllustrations} 
                    disabled={isGeneratingImages}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Icon name={isGeneratingImages ? "Loader2" : "Sparkles"} size={20} className={isGeneratingImages ? "animate-spin" : ""} />
                    {isGeneratingImages ? 'Генерирую иллюстрации...' : 'Сгенерировать иллюстрации сейчас'}
                  </Button>

                  {currentBook.generatedImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Сгенерированные иллюстрации:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {currentBook.generatedImages.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                            <img src={url} alt={`Illustration ${idx + 1}`} className="w-full h-full object-cover" />
                            <Badge className="absolute top-2 right-2">#{idx + 1}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {formStep === 'settings' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pages">Объём книги (страниц)</Label>
                  <Select value={currentBook.pages} onValueChange={(val) => handleInputChange('pages', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите примерный объём" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50-100">50-100 страниц (новелла)</SelectItem>
                      <SelectItem value="100-200">100-200 страниц (повесть)</SelectItem>
                      <SelectItem value="200-300">200-300 страниц (роман)</SelectItem>
                      <SelectItem value="300+">300+ страниц (большой роман)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="writingStyle">Стиль повествования</Label>
                  <Select value={currentBook.writingStyle} onValueChange={(val) => handleInputChange('writingStyle', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите стиль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="literary">Литературный (классический)</SelectItem>
                      <SelectItem value="conversational">Разговорный (современный)</SelectItem>
                      <SelectItem value="poetic">Поэтичный (образный)</SelectItem>
                      <SelectItem value="journalistic">Публицистический (динамичный)</SelectItem>
                      <SelectItem value="minimalist">Минималистичный (лаконичный)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textTone">Тон текста</Label>
                  <Select value={currentBook.textTone} onValueChange={(val) => handleInputChange('textTone', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тон" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serious">Серьёзный</SelectItem>
                      <SelectItem value="light">Лёгкий</SelectItem>
                      <SelectItem value="dramatic">Драматичный</SelectItem>
                      <SelectItem value="humorous">Юмористический</SelectItem>
                      <SelectItem value="philosophical">Философский</SelectItem>
                      <SelectItem value="mysterious">Таинственный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-lg">Итоговые параметры книги:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Название:</strong> {currentBook.title}</p>
                    <p><strong>Жанр:</strong> {currentBook.genre}</p>
                    <p><strong>Персонажей:</strong> {currentBook.characters.length}</p>
                    <p><strong>Иллюстраций:</strong> {currentBook.generatedImages.length}</p>
                    <p><strong>Объём:</strong> {currentBook.pages || 'Не указан'}</p>
                    <p><strong>Стиль:</strong> {currentBook.writingStyle || 'Не указан'}</p>
                    <p><strong>Тон:</strong> {currentBook.textTone || 'Не указан'}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              {formStep !== 'basic' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const steps: Array<'basic' | 'characters' | 'illustrations' | 'settings'> = 
                      ['basic', 'characters', 'illustrations', 'settings'];
                    const currentIdx = steps.indexOf(formStep);
                    if (currentIdx > 0) setFormStep(steps[currentIdx - 1]);
                  }}
                  className="gap-2"
                >
                  <Icon name="ArrowLeft" size={18} />
                  Назад
                </Button>
              )}
              <Button onClick={handleNextStep} className="flex-1 gap-2">
                {formStep === 'settings' ? (
                  <>
                    <Icon name="Check" size={18} />
                    Создать книгу
                  </>
                ) : (
                  <>
                    Далее
                    <Icon name="ArrowRight" size={18} />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="py-12 px-6 animate-fade-in">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Ваша библиотека</h2>
          <p className="text-muted-foreground text-lg">
            {books.length === 0 ? 'Пока нет созданных книг' : `Всего книг: ${books.length}`}
          </p>
        </div>

        {books.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="BookOpen" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">Библиотека пуста</h3>
            <p className="text-muted-foreground mb-6">Создайте свою первую книгу</p>
            <Button onClick={() => setActiveSection('form')} className="gap-2">
              <Icon name="Plus" size={18} />
              Создать книгу
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <Card key={book.id} className="hover:shadow-lg transition-all animate-scale-in overflow-hidden">
                {book.generatedImages.length > 0 && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={book.generatedImages[0]} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{book.genre}</Badge>
                    <Badge variant="outline">{book.characters.length} персонажей</Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{book.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{book.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => downloadBook(book)}
                    >
                      <Icon name="Download" size={16} />
                      Скачать
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="Eye" size={16} />
                      Просмотр
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="py-12 px-6 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold mb-8">Помощь и советы</h2>
        
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tips">Советы</TabsTrigger>
            <TabsTrigger value="examples">Примеры</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            {[
              {
                q: 'Как создать персонажа?',
                a: 'На шаге "Персонажи" нажмите "Добавить" и заполните детальную анкету с внешностью, характером и предысторией.'
              },
              {
                q: 'Сколько иллюстраций можно создать?',
                a: 'От 1 до 10 иллюстраций на книгу. Выберите стиль, цвета и настроение — ИИ создаст уникальные изображения.'
              },
              {
                q: 'В каком формате скачивается книга?',
                a: 'Книга скачивается в текстовом формате (.txt) со всей информацией и ссылками на иллюстрации.'
              },
              {
                q: 'Можно ли редактировать персонажей?',
                a: 'Да, в списке персонажей нажмите на иконку редактирования для изменения любых данных.'
              }
            ].map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                  <CardDescription>{item.a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            {[
              {
                icon: 'UserPlus',
                title: 'Создавайте детальных персонажей',
                desc: 'Чем подробнее анкета персонажа, тем живее получится история. Укажите не только внешность, но и мотивацию.'
              },
              {
                icon: 'Palette',
                title: 'Подбирайте стиль иллюстраций под жанр',
                desc: 'Для фэнтези подойдёт масляная живопись, для детектива — мрачные тона, для романа — акварель.'
              },
              {
                icon: 'BookOpen',
                title: 'Начните с малого объёма',
                desc: 'Для первой книги выберите 50-100 страниц, чтобы быстрее увидеть результат и понять структуру.'
              }
            ].map((tip, idx) => (
              <Card key={idx} className="flex items-start gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon name={tip.icon as any} size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.desc}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Пример персонажа для фэнтези</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Имя:</strong> Элара Светлокрылая</p>
                <p><strong>Возраст:</strong> 18 лет</p>
                <p><strong>Внешность:</strong> Длинные серебристые волосы, изумрудные глаза, хрупкого телосложения</p>
                <p><strong>Характер:</strong> Смелая, но импульсивная. Верит в справедливость и готова рисковать ради других</p>
                <p><strong>Предыстория:</strong> Воспитана в деревне магов, не знала о своём королевском происхождении</p>
                <p><strong>Мотивация:</strong> Вернуть трон и освободить королевство от тирании тёмного мага</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {renderNavigation()}
      {activeSection === 'home' && renderHome()}
      {activeSection === 'form' && renderForm()}
      {activeSection === 'library' && renderLibrary()}
      {activeSection === 'help' && renderHelp()}
    </div>
  );
};

export default Index;
