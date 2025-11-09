import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type BookData = {
  genre: string;
  title: string;
  description: string;
  idea: string;
  mainCharacters: string;
  secondaryCharacters: string;
  villains: string;
  turningPoint: string;
  uniqueFeatures: string;
  pages: string;
  writingStyle: string;
  textTone: string;
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'form' | 'library' | 'help'>('home');
  const [formStep, setFormStep] = useState<'basic' | 'settings'>('basic');
  const [books, setBooks] = useState<Array<BookData & { id: string }>>([]);
  const [currentBook, setCurrentBook] = useState<BookData>({
    genre: '',
    title: '',
    description: '',
    idea: '',
    mainCharacters: '',
    secondaryCharacters: '',
    villains: '',
    turningPoint: '',
    uniqueFeatures: '',
    pages: '',
    writingStyle: '',
    textTone: ''
  });

  const handleInputChange = (field: keyof BookData, value: string) => {
    setCurrentBook(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (formStep === 'basic') {
      if (!currentBook.title || !currentBook.genre) {
        toast.error('Заполните обязательные поля');
        return;
      }
      setFormStep('settings');
      toast.success('Переходим к настройкам книги');
    } else {
      const newBook = { ...currentBook, id: Date.now().toString() };
      setBooks(prev => [...prev, newBook]);
      toast.success('Книга создана! Скоро будет доступна для скачивания');
      setActiveSection('library');
      setFormStep('basic');
      setCurrentBook({
        genre: '',
        title: '',
        description: '',
        idea: '',
        mainCharacters: '',
        secondaryCharacters: '',
        villains: '',
        turningPoint: '',
        uniqueFeatures: '',
        pages: '',
        writingStyle: '',
        textTone: ''
      });
    }
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
            Заполните анкету, опишите персонажей и сюжет — мы создадим для вас готовую книгу,
            которую можно скачать и отредактировать
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'FileText',
                title: 'Заполните анкету',
                description: 'Опишите жанр, сюжет, персонажей и ключевые моменты истории'
              },
              {
                icon: 'Settings',
                title: 'Настройте параметры',
                description: 'Выберите объём, стиль повествования и тон текста'
              },
              {
                icon: 'Download',
                title: 'Получите книгу',
                description: 'Скачайте готовый текст и отредактируйте при необходимости'
              }
            ].map((step, idx) => (
              <Card key={idx} className="animate-scale-in hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                    <Icon name={step.icon as any} size={28} className="text-accent-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
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

  const renderForm = () => (
    <div className="py-12 px-6 animate-fade-in">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">
              {formStep === 'basic' ? 'Основная информация о книге' : 'Настройки стиля и формата'}
            </CardTitle>
            <CardDescription className="text-base">
              {formStep === 'basic' 
                ? 'Расскажите нам о вашей будущей книге' 
                : 'Настройте детали для создания идеального текста'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formStep === 'basic' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-base">Жанр книги *</Label>
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
                  <Label htmlFor="title" className="text-base">Название книги *</Label>
                  <Input 
                    id="title"
                    value={currentBook.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Введите название вашей книги"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Описание сюжета</Label>
                  <Textarea
                    id="description"
                    value={currentBook.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Краткое описание истории..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idea" className="text-base">Главная идея</Label>
                  <Textarea
                    id="idea"
                    value={currentBook.idea}
                    onChange={(e) => handleInputChange('idea', e.target.value)}
                    placeholder="Какую мысль вы хотите донести до читателя?"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="mainCharacters" className="text-base">Главные герои</Label>
                    <Textarea
                      id="mainCharacters"
                      value={currentBook.mainCharacters}
                      onChange={(e) => handleInputChange('mainCharacters', e.target.value)}
                      placeholder="Опишите главных персонажей..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryCharacters" className="text-base">Второстепенные персонажи</Label>
                    <Textarea
                      id="secondaryCharacters"
                      value={currentBook.secondaryCharacters}
                      onChange={(e) => handleInputChange('secondaryCharacters', e.target.value)}
                      placeholder="Опишите второстепенных персонажей..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="villains" className="text-base">Антагонисты / Злодеи</Label>
                  <Textarea
                    id="villains"
                    value={currentBook.villains}
                    onChange={(e) => handleInputChange('villains', e.target.value)}
                    placeholder="Опишите противников главного героя..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turningPoint" className="text-base">Поворотный момент</Label>
                  <Textarea
                    id="turningPoint"
                    value={currentBook.turningPoint}
                    onChange={(e) => handleInputChange('turningPoint', e.target.value)}
                    placeholder="Ключевое событие, меняющее ход истории..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uniqueFeatures" className="text-base">Уникальные фишки</Label>
                  <Textarea
                    id="uniqueFeatures"
                    value={currentBook.uniqueFeatures}
                    onChange={(e) => handleInputChange('uniqueFeatures', e.target.value)}
                    placeholder="Что делает вашу книгу особенной?"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pages" className="text-base">Объём книги (страниц)</Label>
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
                  <Label htmlFor="writingStyle" className="text-base">Стиль повествования</Label>
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
                  <Label htmlFor="textTone" className="text-base">Тон текста</Label>
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
                  <h4 className="font-semibold mb-2 text-lg">Предпросмотр параметров книги:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Название:</strong> {currentBook.title || 'Не указано'}</p>
                    <p><strong>Жанр:</strong> {currentBook.genre || 'Не указан'}</p>
                    <p><strong>Объём:</strong> {currentBook.pages || 'Не указан'}</p>
                    <p><strong>Стиль:</strong> {currentBook.writingStyle || 'Не указан'}</p>
                    <p><strong>Тон:</strong> {currentBook.textTone || 'Не указан'}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              {formStep === 'settings' && (
                <Button variant="outline" onClick={() => setFormStep('basic')} className="gap-2">
                  <Icon name="ArrowLeft" size={18} />
                  Назад
                </Button>
              )}
              <Button onClick={handleNextStep} className="flex-1 gap-2">
                {formStep === 'basic' ? (
                  <>
                    Далее
                    <Icon name="ArrowRight" size={18} />
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={18} />
                    Создать книгу
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
              <Card key={book.id} className="hover:shadow-lg transition-all animate-scale-in">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{book.genre}</Badge>
                    <Icon name="MoreVertical" size={18} className="text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{book.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{book.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1 gap-2">
                      <Icon name="Download" size={16} />
                      Скачать
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Icon name="Edit" size={16} />
                      Редактор
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
                q: 'Как создать книгу?',
                a: 'Перейдите в раздел "Создать книгу", заполните анкету с информацией о сюжете и персонажах, затем настройте стиль и формат книги.'
              },
              {
                q: 'Можно ли редактировать книгу после создания?',
                a: 'Да, все созданные книги доступны для скачивания и редактирования в любом текстовом редакторе.'
              },
              {
                q: 'Какой объём книги лучше выбрать?',
                a: 'Для начала рекомендуем выбрать 100-200 страниц. Это оптимальный размер для первого опыта.'
              },
              {
                q: 'Как выбрать подходящий стиль?',
                a: 'Для фэнтези и фантастики подходит литературный или поэтичный стиль. Для детективов — публицистический.'
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
                icon: 'Lightbulb',
                title: 'Подробно опишите персонажей',
                desc: 'Чем больше деталей вы укажете о характере, внешности и мотивации героев, тем живее получится история.'
              },
              {
                icon: 'Target',
                title: 'Определите конфликт',
                desc: 'Ясно сформулируйте главную проблему или цель героя — это основа любой захватывающей истории.'
              },
              {
                icon: 'Zap',
                title: 'Не бойтесь поворотов',
                desc: 'Неожиданные повороты сюжета делают книгу запоминающейся. Опишите их в соответствующем поле.'
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
                <CardTitle>Пример анкеты для фэнтези романа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Жанр:</strong> Фэнтези</p>
                <p><strong>Название:</strong> "Хранители Забытого Королевства"</p>
                <p><strong>Сюжет:</strong> Молодая девушка обнаруживает, что она — последняя наследница древней магической династии...</p>
                <p><strong>Главный герой:</strong> Элара, 18 лет, смелая и упрямая, воспитана в деревне, не знает о своём происхождении...</p>
                <p><strong>Поворотный момент:</strong> Элара узнаёт, что её лучший друг — шпион короля-узурпатора...</p>
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
