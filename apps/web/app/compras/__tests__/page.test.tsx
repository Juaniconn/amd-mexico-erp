import { render, screen, act } from '@testing-library/react';
import { get, post, patch, del } from '@/lib/api';

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
import ComprasPage from '../page';

describe('ComprasPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el título de la página', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByText('Compras')).toBeInTheDocument();
  });

  it('debe renderizar las tarjetas de estadísticas', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByText('Total Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Total Compras')).toBeInTheDocument();
  });

  it('debe renderizar el campo de búsqueda', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByPlaceholderText(/buscar por folio o proveedor/i)).toBeInTheDocument();
  });

  it('debe mostrar estado vacío cuando no hay órdenes', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByText(/no hay órdenes de compra/i)).toBeInTheDocument();
  });

  it('debe renderizar la lista de órdenes de compra', async () => {
    const mockOrdenes = [
      {
        id: '1',
        folio: 'OC-2026-0001',
        clienteId: 'cliente-1',
        razonSocial: 'Cliente Test',
        fecha: '2026-01-15',
        total: 1165.80,
        estatus: 'BORRADOR',
        moneda: 'MXN',
        proveedores: [],
      },
    ];

    (get as jest.Mock).mockResolvedValue({
      data: mockOrdenes,
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByText('OC-2026-0001')).toBeInTheDocument();
  });

  it('debe renderizar botón Filtrar', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByText('Filtrar')).toBeInTheDocument();
  });

  it('debe renderizar botón de nueva orden', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    expect(screen.getByText('Nueva Orden')).toBeInTheDocument();
  });

  it('debe renderizar filtros de estatus', async () => {
    (get as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, totalPages: 0 },
    });

    await act(async () => {
      render(<ComprasPage />);
    });

    // Check that the select exists with options
    expect(screen.getAllByText('Todos los estatus').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Borrador').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enviada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Recibida').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancelada').length).toBeGreaterThan(0);
  });
});
