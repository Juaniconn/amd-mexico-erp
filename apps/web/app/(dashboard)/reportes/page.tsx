'use client';

export default function ReportesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-600">Indicadores y exportaciones</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="text-4xl mb-2">📊</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Módulo en desarrollo</h3>
        <p className="text-sm text-slate-600">
          Próximamente: KPIs, reportes por módulo y exportación a Excel.
        </p>
      </div>
    </div>
  );
}
