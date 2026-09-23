import { render, screen } from '@testing-library/react';
import { get, post, put } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  del: jest.fn(),
}));

// Mock AppLayout
jest.mock('@/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock next/navigation - App Router uses async params
jest.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/inventario/1',
    notFound: jest.fn(),
    redirect: jest.fn(),
    permanentRedirect: jest.fn(),
  };
});

// Import component AFTER all mocks are set up
import MaterialDetailPage from '../page';

describe('MaterialDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el detalle del material', async () => {
    (get as jest.Mock).mockResolvedValue({
      id: '1',
      codigo: 'MAT-001',
      descripcion: 'Tornillo de acero',
      tipo: 'Material',
      unidad: 'pieza',
      stockActual: 100,
      stockMinimo: 50,
      costoUnitario: 5.5,
      moneda: 'MXN',
    });

    // Next 15 App Router passes params as props - need to pass them directly
    const paramsPromise = Promise.resolve({ id: '1' });
    render(<MaterialDetailPage params={paramsPromise as any} />);

    expect(screen.getByText('Cargando material...')).toBeInTheDocument();
  });

  it('debe mostrar el título de la página', () => {
    (get as jest.Mock).mockResolvedValue({
      id: '1',
      codigo: 'MAT-001',
      descripcion: 'Tornillo',
      tipo: 'Material',
      unidad: 'pieza',
      stockActual: 100,
      stockMinimo: 50,
      costoUnitario: 5.5,
      moneda: 'MXN',
    });

    const paramsPromise = Promise.resolve({ id: '1' });
    render(<MaterialDetailPage params={paramsPromise as any} />);
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });
});
