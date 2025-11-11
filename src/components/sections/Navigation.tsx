import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/auth';

type ActiveSection = 'home' | 'form' | 'library' | 'help' | 'auth' | 'writers';

interface NavigationProps {
  activeSection: ActiveSection;
  user: User | null;
  onSectionChange: (section: ActiveSection) => void;
  onLogout: () => void;
  onNewBook: () => void;
}

const Navigation = ({ activeSection, user, onSectionChange, onLogout, onNewBook }: NavigationProps) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-purple-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-black tracking-wide">Литературная мастерская</h1>
          <div className="flex gap-2">
            <Button
              variant={activeSection === 'home' ? 'default' : 'ghost'}
              onClick={() => onSectionChange('home')}
              className="gap-2"
            >
              <Icon name="Home" className="w-4 h-4" />
              Главная
            </Button>
            {user && (
              <Button
                variant={activeSection === 'form' ? 'default' : 'ghost'}
                onClick={onNewBook}
                className="gap-2"
              >
                <Icon name="Plus" className="w-4 h-4" />
                Создать
              </Button>
            )}
            {user && (
              <Button
                variant={activeSection === 'library' ? 'default' : 'ghost'}
                onClick={() => onSectionChange('library')}
                className="gap-2"
              >
                <Icon name="Library" className="w-4 h-4" />
                Библиотека
              </Button>
            )}
            <Button
              variant={activeSection === 'writers' ? 'default' : 'ghost'}
              onClick={() => onSectionChange('writers')}
              className="gap-2"
            >
              <Icon name="Users" className="w-4 h-4" />
              Писатели
            </Button>
            <Button
              variant={activeSection === 'help' ? 'default' : 'ghost'}
              onClick={() => onSectionChange('help')}
              className="gap-2"
            >
              <Icon name="HelpCircle" className="w-4 h-4" />
              Помощь
            </Button>
            {!user ? (
              <Button
                variant={activeSection === 'auth' ? 'default' : 'ghost'}
                onClick={() => onSectionChange('auth')}
                className="gap-2"
              >
                <Icon name="LogIn" className="w-4 h-4" />
                Войти
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={onLogout}
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
};

export default Navigation;
