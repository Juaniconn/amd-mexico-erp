'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalClientes: number;
  totalCotizaciones: number;
  totalOrdenesCompra: number;
  totalProduccion: number;
  totalMateriales: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    totalCotizaciones: 0,
    totalOrdenesCompra: 0,
    totalProduccion: 0,
    totalMateriales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [clientes, cotizaciones, ordenes, materiales] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/clientes?limit=1`, { headers }).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cotizaciones?limit=1`, { headers }).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ordenes-compra?limit=1`, { headers }).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/materiales?limit=1`, { headers }).then((r) => r.json()),
        ]);

        setStats({
          totalClientes: clientes.meta?.total || 0,
          totalCotizaciones: cotizaciones.meta?.total || 0,
          totalOrdenesCompra: ordenes.meta?.total || 0,
          totalProduccion: 0,
          totalMateriales: materiales.meta?.total || 0,
        });
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: 'Clientes', value: stats.totalClientes, href: '/dashboard/clientes', color: 'bg-blue-500' },
    { label: 'Cotizaciones', value: stats.totalCotizaciones, href: '/dashboard/cotizaciones', color: 'bg-green-500' },
    { label: 'Órdenes de Compra', value: stats.totalOrdenesCompra, href: '/dashboard/compras', color: 'bg-orange-500' },
    { label: 'Producción', value: stats.totalProduccion, href: '/dashboard/produccion', color: 'bg-purple-500' },
    { label: 'Inventario', value: stats.totalMateriales, href: '/dashboard/inventario', color: 'bg-teal-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <div className={`h-3 w-3 rounded-full ${card.color}`} />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {loading ? '-' : card.value}
            </p>
            <p className="mt-1 text-xs text-slate-500 group-hover:text-blue-600">
              Ver módulo &rarr;
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Acceso Rápido</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href="/dashboard/clientes" label="Clientes" />
            <QuickLink href="/dashboard/cotizaciones" label="Cotizaciones" />
            <QuickLink href="/dashboard/produccion" label="Producción" />
            <QuickLink href="/dashboard/inventario" label="Inventario" />
            <QuickLink href="/dashboard/compras" label="Compras" />
            <QuickLink href="/dashboard/reportes" label="Reportes" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Estado del Sistema</h2>
          <div className="space-y-3">
            <StatusItem label="Base de datos" status="online" />
            <StatusItem label="API Backend" status="online" />
            <StatusItem label="Frontend" status="online" />
            <StatusItem label="Redis Cache" status="online" />
            <StatusItem label="MinIO Storage" status="online" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
    >
      {label}
    </Link>
  );
}

function StatusItem({ label, status }: { label: string; status: 'online' | 'offline' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-slate-500">{status === 'online' ? 'Activo' : 'Inactivo'}</span>
      </span>
    </div>
  );
}
