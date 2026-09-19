'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, MobileSidebar, Header } from './Sidebar';
import { Bell, Search, Moon, Sun, LogOut } from 'lucide-react';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/cotizaciones': 'Cotizaciones',
  '/produccion': 'Producción',
  '/inventario': 'Inventario',
  '/compras': 'Compras',
  '/proveedores': 'Proveedores',
  '/calidad': 'Calidad',
  '/reportes': 'Reportes',
  '/usuarios': 'Usuarios',
};

// Notification types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
}

const sampleNotifications: Notification[] = [
  { id: '1', title: 'Stock bajo', message: 'ALU-6061 ha atteintado el nivel mínimo', type: 'warning', time: 'Hace 15 min' },
  { id: '2', title: 'OT asignada', message: 'OT-2026-001 asignada a Operador #5', type: 'info', time: 'Hace 1 hora' },
  { id: '3', title: 'Cotización aprobada', message: 'COT-2026-004 fue aprobada por el cliente', type: 'success', time: 'Hace 2 horas' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('amd-theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('amd-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.clear();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="brand-gradient animate-pulse-brand h-12 w-12 rounded-xl shadow-brand/30 shadow-lg" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Sesión expirada. Redirigiendo...</p>
      </div>
    );
  }

  const title = titles[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Header 
          title={title} 
          user={user} 
          onMenuClick={() => setMobileOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Logout button - floating for all screens */}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-lg transition hover:bg-accent hover:text-accent-foreground"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>

      {/* Notification Panel */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setNotificationsOpen(false)}>
          <div className="absolute right-4 top-14 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-card p-4 shadow-2xl ring-1 ring-foreground/10" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Notificaciones</h3>
              <button onClick={() => setNotificationsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sampleNotifications.map(n => (
                <div key={n.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg rounded-xl bg-card p-4 shadow-2xl ring-1 ring-foreground/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar clientes, cotizaciones, OT..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
                autoFocus
              />
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <div className="mt-3 max-h-80 overflow-y-auto space-y-1 text-sm">
              <p className="px-3 py-2 text-muted-foreground text-xs">Presiona ⌘K / Ctrl+K para buscar en cualquier momento</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
