'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, MobileSidebar, Header } from './Sidebar';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/cotizaciones': 'Cotizaciones',
  '/ventas': 'Ventas',
  '/crm': 'CRM',
  '/produccion': 'Producción',
  '/inventario': 'Inventario',
  '/compras': 'Compras',
  '/proveedores': 'Proveedores',
  '/calidad': 'Calidad',
  '/reportes': 'Reportes',
  '/settings/users': 'Usuarios',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Header title={title} user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Logout button for demo purposes */}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger shadow-lg transition hover:bg-danger/20 lg:hidden"
        title="Cerrar sesión"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}
