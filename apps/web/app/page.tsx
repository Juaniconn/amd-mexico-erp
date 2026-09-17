'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { get } from '@/lib/api';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  role: string;
  sucursal?: {
    id: string;
    nombre: string;
    ciudad: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL (from login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      localStorage.setItem('accessToken', urlToken);
      window.history.replaceState({}, '', '/');
    }

    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (e) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-white mb-4">Sesión expirada. Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">AMD México</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión Industrial</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/clientes">Clientes</NavLink>
          <NavLink href="/cotizaciones">Cotizaciones</NavLink>
          <NavLink href="/ventas">Ventas</NavLink>
          <NavLink href="/produccion">Producción</NavLink>
          <NavLink href="/inventario">Inventario</NavLink>
          <NavLink href="/compras">Compras</NavLink>
          <NavLink href="/proveedores">Proveedores</NavLink>
          <NavLink href="/calidad">Calidad</NavLink>
          <NavLink href="/reportes">Reportes</NavLink>
          <NavLink href="/crm">CRM</NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {user.nombre.charAt(0)}
              {user.apellido.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <DashboardContent />
      </main>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState({
    clientes: 0,
    cotizaciones: 0,
    ordenesCompra: 0,
    ordenesTrabajo: 0,
    materiales: 0,
    proveedores: 0,
    operaciones: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    Promise.all([
      get<{ data: { meta: { total: number } } }>('/api/clientes?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/cotizaciones?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/ordenes-compra?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/ordenes-trabajo?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/materiales?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/proveedores?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/operaciones?limit=1'),
    ])
      .then(([cli, cot, oc, ot, mat, prov, op]) => {
        setStats({
          clientes: cli?.data?.meta?.total || 0,
          cotizaciones: cot?.data?.meta?.total || 0,
          ordenesCompra: oc?.data?.meta?.total || 0,
          ordenesTrabajo: ot?.data?.meta?.total || 0,
          materiales: mat?.data?.meta?.total || 0,
          proveedores: prov?.data?.meta?.total || 0,
          operaciones: op?.data?.meta?.total || 0,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes" value={stats.clientes} />
        <StatCard title="Cotizaciones" value={stats.cotizaciones} />
        <StatCard title="Órdenes de Compra" value={stats.ordenesCompra} />
        <StatCard title="Órdenes de Trabajo" value={stats.ordenesTrabajo} />
        <StatCard title="Materiales" value={stats.materiales} />
        <StatCard title="Proveedores" value={stats.proveedores} />
        <StatCard title="Operaciones" value={stats.operaciones} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
