'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || '/api'}/inventario/materiales?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error('Error al cargar inventario');
        }

        const data = await res.json();
        setItems(data.data || []);
      } catch (err: any) {
        setError(err?.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-600">
            Materiales, stock y movimientos
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Existencia</th>
              <th className="px-4 py-3">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Cargando...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Sin registros</td>
              </tr>
            ) : (
              items.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{m.codigo}</td>
                  <td className="px-4 py-3">{m.descripcion}</td>
                  <td className="px-4 py-3 text-slate-500">{m.unidad}</td>
                  <td className="px-4 py-3 text-slate-500">{m.stockActual ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
