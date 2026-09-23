'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, FileText, ShoppingCart, Hammer, Package,
  Factory, CheckCircle, BarChart3, Wrench, Server, Shield, X, Zap, Cog,
  Menu, Search, Bell, Moon, Sun, ChevronDown, LogOut, Bot, Sparkles,
  ArrowLeftRight, Truck,
} from 'lucide-react';

const modules = [
  { section: 'PRINCIPAL', items: [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'OPERACIONES', items: [
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
  ]},
  { section: 'PRODUCCIÓN', items: [
    { href: '/produccion', icon: Hammer, label: 'Producción' },
    { href: '/maquinaria', icon: Cog, label: 'Maquinaria' },
    { href: '/inventario', icon: Package, label: 'Inventario' },
    { href: '/transferencias', icon: ArrowLeftRight, label: 'Transferencias' },
    { href: '/compras', icon: ShoppingCart, label: 'Compras' },
    { href: '/proveedores', icon: Factory, label: 'Proveedores' },
    { href: '/embarques', icon: Truck, label: 'Embarques' },
  ]},
  { section: 'INGENIERÍA', items: [
    { href: '/ingenieria', icon: Wrench, label: 'Diseño' },
  ]},
  { section: 'CALIDAD', items: [
    { href: '/calidad', icon: CheckCircle, label: 'Calidad' },
    { href: '/reportes', icon: BarChart3, label: 'Reportes' },
    { href: '/facturacion', icon: FileText, label: 'Facturación' },
  ]},
  { section: 'INFRAESTRUCTURA', items: [
    { href: '/vps', icon: Server, label: 'VPS' },
    { href: '/agentes', icon: Bot, label: 'Agentes Hermes' },
    { href: '/agentes-cursor', icon: Sparkles, label: 'Agentes Cursor' },
  ]},
  { section: 'SISTEMA', items: [
    { href: '/usuarios', icon: Shield, label: 'Usuarios' },
  ]},
];

function useNavPermisos() {
  const [user, setUser] = useState<any>(null);
  const [permisos, setPermisos] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedPermisos = localStorage.getItem('permisos');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedPermisos) setPermisos(JSON.parse(storedPermisos));
  }, []);

  const tienePermiso = (modulo: string, accion: string): boolean => {
    if (user?.role === 'ADMIN') return true;
    if (permisos['*']?.includes('*')) return true;
    if (Object.keys(permisos).length === 0) {
      if (user?.role === 'GERENTE') return true;
      return ['dashboard', 'produccion', 'maquinaria', 'inventario'].includes(modulo) && accion === 'ver';
    }
    if (modulo === 'transferencias') {
      const inv = permisos['inventario'] || [];
      if (inv.includes(accion) || inv.includes('transferencias') || inv.includes('admin')) return true;
    }
    if (modulo === 'embarques') {
      const prod = permisos['produccion'] || [];
      if (prod.includes(accion) || prod.includes('admin')) return true;
    }
    const acciones = permisos[modulo] || [];
    return acciones.includes(accion);
  };

  const modulosVisibles = modules
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const modulo = item.href.replace('/', '') || 'dashboard';
        return tienePermiso(modulo, 'ver');
      }),
    }))
    .filter((section) => section.items.length > 0);

  return { user, tienePermiso, modulosVisibles };
}

function useSucursalFilter() {
  const [user, setUser] = useState<any>(null);
  const [sucursales, setSucursales] = useState<Array<{ id: string; codigo: string; nombre: string }>>([]);
  const [sucursalFilter, setSucursalFilter] = useState('all');
  const [sucursalBadge, setSucursalBadge] = useState('…');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedFilter = localStorage.getItem('sucursalFilter') || 'all';
    if (storedUser) setUser(JSON.parse(storedUser));
    setSucursalFilter(storedFilter);

    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch('/api/auth/sucursales', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setSucursales(list);
          if (storedFilter === 'all') {
            setSucursalBadge('Todas');
          } else {
            const found = list.find((s: { id: string }) => s.id === storedFilter);
            const fromUser = JSON.parse(localStorage.getItem('sucursal') || 'null');
            setSucursalBadge(found?.codigo || fromUser?.codigo || 'Sucursal');
          }
        })
        .catch(() => {
          const fromUser = JSON.parse(localStorage.getItem('sucursal') || 'null');
          setSucursalBadge(storedFilter === 'all' ? 'Todas' : fromUser?.codigo || 'Sucursal');
        });
    }
  }, []);

  const canFilterAll = user?.role === 'ADMIN' || user?.role === 'GERENTE';

  const onFilterChange = (value: string) => {
    setSucursalFilter(value);
    localStorage.setItem('sucursalFilter', value);
    window.location.reload();
  };

  return { canFilterAll, sucursales, sucursalFilter, sucursalBadge, onFilterChange };
}

function SucursalBlock({
  canFilterAll,
  sucursales,
  sucursalFilter,
  sucursalBadge,
  onFilterChange,
  compact = false,
}: {
  canFilterAll: boolean;
  sucursales: Array<{ id: string; codigo: string; nombre: string }>;
  sucursalFilter: string;
  sucursalBadge: string;
  onFilterChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
        Sucursal
      </p>
      {canFilterAll && sucursales.length > 0 ? (
        <select
          value={sucursalFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className={`w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-gray-200 outline-none focus:border-blue-500/40 ${
            compact ? 'py-2 text-xs' : 'min-h-11 py-2.5 text-sm'
          }`}
        >
          <option value="all">Todas</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.codigo} — {s.nombre}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-sm font-medium text-gray-300 truncate">{sucursalBadge}</span>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { modulosVisibles } = useNavPermisos();
  const sucursal = useSucursalFilter();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/[0.04] bg-gradient-to-b from-[#0a0e14] to-[#0d1117] transition-all duration-300 ease-out lg:flex">
      <div className="flex h-14 items-center justify-start border-b border-white/[0.06] px-4 pt-[env(safe-area-inset-top)]">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/20">
          <Zap className="h-4 w-4 text-white" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0e14]" />
        </div>
        <div className="ml-3 flex flex-col">
          <span className="text-xs font-semibold tracking-tight text-white">AMD México</span>
          <span className="text-[10px] font-medium text-gray-500">Operations ERP</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {modulosVisibles.map((section) => (
          <div key={section.section} className="mb-4 last:mb-0">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
              {section.section}
            </p>
            <ul className="space-y-[2px]">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/15 to-transparent text-white'
                          : isHovered
                          ? 'bg-white/[0.04] text-gray-300'
                          : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-300'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                      )}
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'text-blue-400'
                            : isHovered
                            ? 'text-gray-300'
                            : 'text-gray-600 group-hover:text-gray-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/[0.06] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <SucursalBlock {...sucursal} compact />
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-gray-600">v2.0 · AMD Operations</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { modulosVisibles } = useNavPermisos();
  const sucursal = useSucursalFilter();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-white/[0.06] bg-gradient-to-b from-[#0a0e14] to-[#0d1117] animate-fade-in pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0e14]" />
            </div>
            <span className="text-xs font-semibold text-white">AMD México</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {modulosVisibles.map((section) => (
            <div key={section.section} className="mb-4 last:mb-0">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
                {section.section}
              </p>
              <ul className="space-y-[2px]">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/15 to-transparent text-white'
                            : 'text-gray-400 active:bg-white/[0.06] hover:bg-white/[0.04] hover:text-gray-300'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                        )}
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-600'}`}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] px-4 py-3">
          <SucursalBlock {...sucursal} />
        </div>
      </aside>
    </div>
  );
}

export function Header({
  title,
  user,
  onMenuClick,
  onNotificationsClick,
  onSearchClick,
  onThemeToggle,
  onLogout,
  theme,
  notificationCount,
}: {
  title: string;
  user: any;
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  onSearchClick: () => void;
  onThemeToggle: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  notificationCount: number;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-white/[0.06] bg-[#0a0e14] px-3 pt-[env(safe-area-inset-top)] sm:gap-3 sm:px-6 sm:h-14">
      <button
        onClick={onMenuClick}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold tracking-tight text-white">{title}</h1>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
        <button
          onClick={onSearchClick}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
          title="Buscar"
          aria-label="Buscar"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={onNotificationsClick}
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
          aria-label={`Notificaciones${notificationCount > 0 ? `, ${notificationCount} pendientes` : ''}`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#0a0e14]">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <button
          onClick={onThemeToggle}
          className="hidden h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white sm:flex"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        <div className="mx-0.5 hidden h-6 w-px bg-white/[0.08] sm:block" />

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex min-h-11 items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition hover:bg-white/[0.06]"
          >
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white shadow-sm">
                {user?.nombre?.charAt(0)}
                {user?.apellido?.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0e14]" />
            </div>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-gray-500 transition-transform duration-200 sm:block ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-[#141920] shadow-2xl">
                <div className="border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow-sm">
                      {user?.nombre?.charAt(0)}
                      {user?.apellido?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      onThemeToggle();
                      setUserMenuOpen(false);
                    }}
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.06] sm:hidden"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function UserDropdown({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div
      className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-border bg-popover shadow-lg"
      role="menu"
    >
      <div className="border-b border-border px-3 py-2">
        <p className="truncate font-mono text-[11px] text-muted-foreground">{user?.email}</p>
      </div>
      <div className="p-1">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
          role="menuitem"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
