import { render, screen } from '@testing-library/react';

// Mock API first (before importing component)
jest.mock('@/lib/api', () => ({
  get: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, totalPages: 0 } }),
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

// Mock next/navigation with proper router mock
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => ({
      get: jest.fn(),
      getAll: jest.fn(),
      has: jest.fn(),
      forEach: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      toString: jest.fn(),
      append: jest.fn(),
      delete: jest.fn(),
      set: jest.fn(),
      sort: jest.fn(),
      [Symbol.iterator]: jest.fn(),
    }),
    usePathname: () => '/inventario',
    useParams: () => ({ id: '1' }),
    notFound: jest.fn(),
    redirect: jest.fn(),
    permanentRedirect: jest.fn(),
  };
});

// Import component AFTER all mocks are set up
import InventarioPage from '../page';

describe('InventarioPage', () => {
  it('debe renderizar el título de la página', () => {
    render(<InventarioPage />);
    expect(screen.getByText('Inventario')).toBeInTheDocument();
  });

  it('debe renderizar el botón de nuevo material', () => {
    render(<InventarioPage />);
    expect(screen.getByText(/nuevo material/i)).toBeInTheDocument();
  });

  it('debe renderizar las tarjetas de estadísticas', () => {
    render(<InventarioPage />);
    expect(screen.getByText('Total Materiales')).toBeInTheDocument();
    expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
    expect(screen.getByText('Sin Stock')).toBeInTheDocument();
    expect(screen.getByText('Valor Total')).toBeInTheDocument();
  });

  it('debe renderizar el campo de búsqueda', () => {
    render(<InventarioPage />);
    expect(screen.getByPlaceholderText(/código o nombre/i)).toBeInTheDocument();
  });
});
