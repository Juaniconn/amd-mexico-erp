import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Hammer,
  Package,
  Factory,
  CheckCircle,
  BarChart3,
  Zap,
  Moon,
  Sun,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Wrench,
  Upload,
  FileCheck,
  Clock,
} from 'lucide-react';

const modules = [
  { section: 'Principal', items: [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Operaciones', items: [
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
    { href: '/cotizaciones/[id]', icon: FileText, label: 'Detalle Cotización' },
  ]},
  { section: 'Producción', items: [
    { href: '/produccion', icon: Hammer, label: 'Producción' },
    { href: '/inventario', icon: Package, label: 'Inventario' },
    { href: '/compras', icon: ShoppingCart, label: 'Compras' },
    { href: '/proveedores', icon: Factory, label: 'Proveedores' },
  ]},
  { section: 'Ingeniería', items: [
    { href: '/ingenieria', icon: Wrench, label: 'Diseño' },
  ]},
  { section: 'Calidad', items: [
    { href: '/calidad', icon: CheckCircle, label: 'Calidad' },
    { href: '/reportes', icon: BarChart3, label: 'Reportes' },
  ]},
  { section: 'Sistema', items: [
    { href: '/usuarios', icon: Shield, label: 'Usuarios' },
  ]},
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform duration-300 ease-out max-lg:hidden">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="brand-gradient shadow-brand/30 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">AMD México</span>
            <span className="block text-[10px] text-gray-500">Operations ERP</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {modules.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-gray-500 transition group-hover:text-sidebar-primary" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[10px] text-gray-600">v2.0 · AMD Operations</p>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar">
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">AMD México</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {modules.map((section) => (
            <div key={section.section} className="mb-4">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {section.section}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition hover:bg-sidebar-accent"
                    >
                      <item.icon className="h-4 w-4 text-gray-500" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
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
  theme 
}: { 
  title: string; 
  user: any; 
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  onSearchClick: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-sm font-semibold text-white animate-fade-up">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <button 
          onClick={onSearchClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-sidebar-accent hover:text-white"
          title="Buscar (⌘K)"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button 
          onClick={onNotificationsClick}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-sidebar-accent hover:text-white"
          title="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Theme toggle */}
        <button 
          onClick={onThemeToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-sidebar-accent hover:text-white"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-sidebar-accent">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white">{user?.nombre} {user?.apellido}</p>
            <p className="text-[10px] text-gray-500">{user?.role}</p>
          </div>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </div>
      </div>
    </header>
  );
}
