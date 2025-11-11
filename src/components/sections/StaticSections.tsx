import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/auth';
import { worldWriters } from '@/data/writers';

interface HomeSectionProps {
  user: User | null;
  onNavigateToForm: () => void;
}

export const HomeSection = ({ user, onNavigateToForm }: HomeSectionProps) => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Создайте свою книгу с помощью ИИ
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Превратите свои идеи в полноценные литературные произведения с иллюстрациями
        </p>
        {user && (
          <Button
            size="lg"
            onClick={onNavigateToForm}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
          >
            <Icon name="Plus" className="w-5 h-5 mr-2" />
            Начать создание книги
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
  );
};

interface AuthSectionProps {
  authMode: 'login' | 'register';
  authForm: { email: string; password: string; name: string };
  onAuthFormChange: (form: { email: string; password: string; name: string }) => void;
  onAuthModeChange: (mode: 'login' | 'register') => void;
  onSubmit: () => void;
}

export const AuthSection = ({ authMode, authForm, onAuthFormChange, onAuthModeChange, onSubmit }: AuthSectionProps) => {
  return (
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
                onChange={(e) => onAuthFormChange({ ...authForm, name: e.target.value })}
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
              onChange={(e) => onAuthFormChange({ ...authForm, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={authForm.password}
              onChange={(e) => onAuthFormChange({ ...authForm, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={onSubmit} className="w-full">
            {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onAuthModeChange(authMode === 'login' ? 'register' : 'login')}
            className="w-full"
          >
            {authMode === 'login' 
              ? 'Нет аккаунта? Зарегистрируйтесь' 
              : 'Уже есть аккаунт? Войдите'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const WritersSection = () => {
  return (
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
  );
};

export const HelpSection = () => {
  return (
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
  );
};
