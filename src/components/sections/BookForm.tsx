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
  chapters?: { title: string; text: string }[];
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

interface BookFormProps {
  currentBook: BookData;
  currentCharacter: Omit<Character, 'id'>;
  editingBook: string | null;
  editingCharacter: Character | null;
  formStep: 'basic' | 'characters' | 'illustrations' | 'settings';
  isCharacterDialogOpen: boolean;
  isGeneratingImages: boolean;
  isGeneratingBook: boolean;
  onInputChange: (field: keyof BookData, value: any) => void;
  onCharacterChange: (field: keyof Omit<Character, 'id'>, value: string) => void;
  onGenreToggle: (genre: string) => void;
  onWritingStyleToggle: (style: string) => void;
  onTextToneToggle: (tone: string) => void;
  onAddCharacter: () => void;
  onEditCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onGenerateImages: () => void;
  onGenerateBook: () => void;
  setFormStep: (step: 'basic' | 'characters' | 'illustrations' | 'settings') => void;
  setIsCharacterDialogOpen: (open: boolean) => void;
  setEditingCharacter: (character: Character | null) => void;
  setCurrentCharacter: (character: Omit<Character, 'id'>) => void;
}

const BookForm = ({
  currentBook,
  currentCharacter,
  editingBook,
  editingCharacter,
  formStep,
  isCharacterDialogOpen,
  isGeneratingImages,
  isGeneratingBook,
  onInputChange,
  onCharacterChange,
  onGenreToggle,
  onWritingStyleToggle,
  onTextToneToggle,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onGenerateImages,
  onGenerateBook,
  setFormStep,
  setIsCharacterDialogOpen,
  setEditingCharacter,
  setCurrentCharacter
}: BookFormProps) => {
  return (
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
                  onChange={(e) => onInputChange('title', e.target.value)}
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
                      onClick={() => onGenreToggle(genre)}
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
                  onChange={(e) => onInputChange('description', e.target.value)}
                  placeholder="О чем ваша книга?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idea">Основная идея книги *</Label>
                <Textarea
                  id="idea"
                  value={currentBook.idea}
                  onChange={(e) => onInputChange('idea', e.target.value)}
                  placeholder="Какую идею вы хотите донести?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turningPoint">Ключевой поворот сюжета</Label>
                <Textarea
                  id="turningPoint"
                  value={currentBook.turningPoint}
                  onChange={(e) => onInputChange('turningPoint', e.target.value)}
                  placeholder="Главное событие, меняющее ход истории"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueFeatures">Уникальные особенности</Label>
                <Textarea
                  id="uniqueFeatures"
                  value={currentBook.uniqueFeatures}
                  onChange={(e) => onInputChange('uniqueFeatures', e.target.value)}
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
                  onChange={(e) => onInputChange('pages', e.target.value)}
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
                          onChange={(e) => onCharacterChange('name', e.target.value)}
                          placeholder="Имя персонажа"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="char-age">Возраст *</Label>
                        <Input
                          id="char-age"
                          value={currentCharacter.age}
                          onChange={(e) => onCharacterChange('age', e.target.value)}
                          placeholder="Возраст или возрастная группа"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="char-role">Роль в истории</Label>
                        <Select
                          value={currentCharacter.role}
                          onValueChange={(value) => onCharacterChange('role', value)}
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
                          onChange={(e) => onCharacterChange('appearance', e.target.value)}
                          placeholder="Опишите внешность персонажа"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="char-personality">Характер и личность</Label>
                        <Textarea
                          id="char-personality"
                          value={currentCharacter.personality}
                          onChange={(e) => onCharacterChange('personality', e.target.value)}
                          placeholder="Черты характера, особенности поведения"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="char-background">Предыстория</Label>
                        <Textarea
                          id="char-background"
                          value={currentCharacter.background}
                          onChange={(e) => onCharacterChange('background', e.target.value)}
                          placeholder="История жизни персонажа"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="char-motivation">Мотивация</Label>
                        <Textarea
                          id="char-motivation"
                          value={currentCharacter.motivation}
                          onChange={(e) => onCharacterChange('motivation', e.target.value)}
                          placeholder="Что движет персонажем?"
                          rows={3}
                        />
                      </div>

                      <Button onClick={onAddCharacter} className="w-full">
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
                              onClick={() => onEditCharacter(character)}
                            >
                              <Icon name="Edit" className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteCharacter(character.id)}
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
                      onInputChange('illustrations', {
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
                      onInputChange('illustrations', {
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
                      onInputChange('illustrations', {
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
                      onInputChange('illustrations', {
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
                  onClick={onGenerateImages}
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
                              onInputChange('generatedImages', newImages);
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
                      onClick={() => onWritingStyleToggle(style)}
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
                      onClick={() => onTextToneToggle(tone)}
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
                  onClick={onGenerateBook}
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
  );
};

export default BookForm;
