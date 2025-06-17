// src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { Button } from './ui/button';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Target, 
  Trophy, 
  Settings,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';

export function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/nova-transacao', icon: Plus, label: 'Nova Transação' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
    { path: '/metas', icon: Target, label: 'Metas' },
    { path: '/missoes', icon: Trophy, label: 'Missões' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' }
  ];

  const isActive = (path) => location.pathname === path;

  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Header */}
      <header className="bg-card border-b border-border theme-transition">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CF</span>
              </div>
              <h1 className="text-xl font-bold text-primary hidden sm:block">
                Chave Financeira
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Olá, {user?.nome}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="p-2"
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border theme-transition sm:hidden">
        <div className="grid grid-cols-6 h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={item.label}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation (Desktop) */}
      <nav className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border theme-transition hidden lg:block">
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Padding for Desktop */}
      <style jsx>{`
        @media (min-width: 1024px) {
          main {
            margin-left: 16rem;
          }
        }
        
        @media (max-width: 640px) {
          main {
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </div>
  );
}

