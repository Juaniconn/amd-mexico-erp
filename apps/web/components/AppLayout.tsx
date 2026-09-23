'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, MobileSidebar, Header } from './Sidebar';

const titles: Record<string, string> = {
  '/': 'Dashboard', '/clientes': 'Clientes', '/cotizaciones': 'Cotizaciones',
  '/produccion': 'Producción', '/inventario': 'Inventario', '/compras': 'Compras',
  '/proveedores': 'Proveedores', '/calidad': 'Calidad', '/reportes': 'Reportes',
  '/usuarios': 'Usuarios', '/facturacion': 'Facturación', '/ingenieria': 'Ingeniería',
  '/maquinaria': 'Maquinaria', '/vps': 'VPS', '/embarques': 'Embarques',
  '/transferencias': 'Transferencias',
  '/agentes': 'Agentes Hermes', '/agentes-cursor': 'Agentes Cursor',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [permisos, setPermisos] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Initialize theme
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
    const initial = stored || (prefersLight ? 'light' : 'dark');
    setTheme(initial);
    if (initial === 'light') document.documentElement.classList.add('light');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    const storedPermisos = localStorage.getItem('permisos');
    if (!token || !storedUser) { router.push('/login'); return; }
    try {
      setUser(JSON.parse(storedUser));
      if (storedPermisos) setPermisos(JSON.parse(storedPermisos));
    } catch { localStorage.clear(); router.push('/login'); }
    finally { setLoading(false); }
  }, [router]);

  const tienePermiso = (modulo: string, accion: string): boolean => {
    if (permisos['*']?.includes('*')) return true; // Admin
    const acciones = permisos[modulo] || [];
    return acciones.includes(accion);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };
  const handleNotificationsClick = useCallback(() => {
    setNotificationsOpen(v => !v);
    if (!notificationsOpen) {
      setNotificationsLoading(true);
      fetch('/api/dashboard/alerts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then(r => r.json())
        .then(data => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]))
        .finally(() => setNotificationsLoading(false));
    }
  }, [notificationsOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setNotificationsOpen(false); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Cargando">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-mono text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-xs font-mono text-muted-foreground">Sesión expirada. Redirigiendo...</p>
      </div>
    );
  }

  const title = titles[pathname] || 'Dashboard';
  const notificationCount = notifications.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-mono focus:text-primary-foreground">
        Saltar al contenido principal
      </a>
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col pl-0 lg:pl-60">
        <Header
          title={title}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          onNotificationsClick={handleNotificationsClick}
          onSearchClick={() => setSearchOpen(true)}
          onThemeToggle={toggleTheme}
          onLogout={handleLogout}
          theme={theme}
          notificationCount={notificationCount}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 lg:p-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      {notificationsOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setNotificationsOpen(false)} role="dialog" aria-modal="true" aria-label="Panel de notificaciones">
          <div className="absolute right-3 top-[calc(2.75rem+env(safe-area-inset-top))] w-80 max-w-[calc(100vw-1.5rem)] rounded-md border border-border bg-popover p-3 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-foreground">Notificaciones</h3>
              <button onClick={() => setNotificationsOpen(false)} className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground text-xs" aria-label="Cerrar notificaciones">✕</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificationsLoading ? (
                <div className="py-6 text-center">
                  <p className="text-xs font-mono text-muted-foreground">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs font-mono text-muted-foreground">Sin notificaciones</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Las alertas aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => { setNotificationsOpen(false); router.push(n.url || '/'); }}
                      className="w-full min-h-11 text-left rounded-lg p-3 transition hover:bg-muted/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${
                          n.severity === 'critica' ? 'bg-red-500' :
                          n.severity === 'alta' ? 'bg-amber-500' :
                          n.severity === 'media' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />
                        <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                      </div>
                      <p className="mt-0.5 pl-4 text-[10px] text-muted-foreground truncate">{n.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[calc(4rem+env(safe-area-inset-top))]" onClick={() => setSearchOpen(false)} role="dialog" aria-modal="true" aria-label="Buscador">
          <div className="w-full max-w-md rounded-md border border-border bg-popover p-3 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Buscar clientes, OT, cotizaciones..." className="min-h-11 flex-1 bg-transparent text-sm text-foreground focus:outline-none" autoFocus aria-label="Campo de búsqueda" />
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">ESC</kbd>
            </div>
            <div className="mt-2"><p className="px-2 py-1 text-[10px] text-muted-foreground">Toca fuera o ESC para cerrar</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
