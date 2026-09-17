'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/Card';
import { get } from '@/lib/api';

export default function Home() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen de operaciones AMD México</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    <Card className="card-premium p-4 transition-all duration-200 hover:shadow-lg">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </Card>
  );
}
