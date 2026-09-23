interface StatCardProps { label: string; value: string | number; iconBg?: string; iconColor?: string; icon?: React.ReactNode; trend?: string; trendUp?: boolean; }

export function StatCard({ label, value, iconBg = 'bg-blue-500/10', iconColor = 'text-blue-400', icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141920] p-4 transition-all duration-200 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500">{label}</p>
          <p className="mt-1.5 font-mono text-xl font-bold tabular-nums text-white">{value}</p>
          {trend && (
            <p className={`mt-1 text-[10px] font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{children}</div>;
}
