import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AMD México ERP',
  description: 'Sistema de Gestión Industrial - Manufactura',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
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
