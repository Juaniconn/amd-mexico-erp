import { render, screen, act } from '@testing-library/react';
import { get, post } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

// Mock AppLayout
jest.mock('@/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock next/navigation
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
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/compras',
    useParams: () => ({ id: '1' }),
    notFound: jest.fn(),
    redirect: jest.fn(),
    permanentRedirect: jest.fn(),
  };
});

// Import component AFTER all mocks are set up
import ComprasPage from '../../page';

describe('ComprasPage - Formulario Nueva Orden', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el formulario de nueva orden', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    const nuevaOrdenButton = screen.getByText('Nueva Orden');
    await act(async () => {
      nuevaOrdenButton.click();
    });

    expect(screen.getByText('Nueva Orden de Compra')).toBeInTheDocument();
  });

  it('debe mostrar el campo Cliente en el formulario', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    const nuevaOrdenButton = screen.getByText('Nueva Orden');
    await act(async () => {
      nuevaOrdenButton.click();
    });

    expect(screen.getByText('Cliente *')).toBeInTheDocument();
  });

  it('debe mostrar el campo Moneda', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    const nuevaOrdenButton = screen.getByText('Nueva Orden');
    await act(async () => {
      nuevaOrdenButton.click();
    });

    expect(screen.getByText('Moneda')).toBeInTheDocument();
  });

  it('debe mostrar el botón Cancelar en el formulario', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    const nuevaOrdenButton = screen.getByText('Nueva Orden');
    await act(async () => {
      nuevaOrdenButton.click();
    });

    expect(screen.getAllByText('Cancelar').length).toBeGreaterThan(0);
  });

  it('debe mostrar el botón Crear Orden', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    const nuevaOrdenButton = screen.getByText('Nueva Orden');
    await act(async () => {
      nuevaOrdenButton.click();
    });

    expect(screen.getByText('Crear Orden')).toBeInTheDocument();
  });

  it('debe mostrar la sección de proveedores', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    const nuevaOrdenButton = screen.getByText('Nueva Orden');
    await act(async () => {
      nuevaOrdenButton.click();
    });

    expect(screen.getByText('Proveedores')).toBeInTheDocument();
  });
});
