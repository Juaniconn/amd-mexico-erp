import { render, screen, waitFor } from '@testing-library/react';
import { get } from '@/lib/api';

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

// Mock next/navigation - App Router uses sync params object
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({ id: '1' }),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Import component AFTER all mocks are set up
import CompraDetailPage from '../page';

describe('CompraDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar estado de carga', () => {
    (get as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

    render(<CompraDetailPage params={{ id: '1' }} />);

    expect(screen.getByText('Cargando orden de compra...')).toBeInTheDocument();
  });

  it('debe renderizar error cuando falla la carga', async () => {
    (get as jest.Mock).mockRejectedValue(new Error('Not found'));

    render(<CompraDetailPage params={{ id: '999' }} />);

    await waitFor(() => {
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });
  });

  it('debe renderizar detalles de la orden', async () => {
    const mockData = {
      id: '1',
      folio: 'OC-2026-0001',
      razonSocial: 'Proveedor Test',
      fecha: '2026-01-15',
      total: 1165.80,
      impuestos: 160.80,
      estatus: 'BORRADOR',
      moneda: 'MXN',
      condicionesPago: '30 días',
      notas: 'Notas de prueba',
      detalles: [
        {
          id: 'd1',
          material: 'Material A',
          descripcion: 'Tornillo',
          cantidad: 10,
          precioUnitario: 100.50,
          importe: 1005.00,
        },
      ],
    };

    (get as jest.Mock).mockResolvedValue(mockData);

    render(<CompraDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getAllByText('OC-2026-0001').length).toBeGreaterThan(0);
      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(screen.getByText('Folio')).toBeInTheDocument();
      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getAllByText('Total').length).toBeGreaterThan(0);
      expect(screen.getByText('Detalles')).toBeInTheDocument();
      expect(screen.getByText('Información General')).toBeInTheDocument();
      expect(screen.getByText('Detalles de la Orden')).toBeInTheDocument();
      expect(screen.getByText('Material A')).toBeInTheDocument();
    });
  });

  it('debe mostrar notas cuando existen', async () => {
    const mockData = {
      id: '1',
      folio: 'OC-2026-0001',
      razonSocial: 'Proveedor Test',
      fecha: '2026-01-15',
      total: 500,
      impuestos: 80,
      estatus: 'RECIBIDA',
      moneda: 'MXN',
      condicionesPago: '15 días',
      notas: 'Orden urgente',
      detalles: [],
    };

    (get as jest.Mock).mockResolvedValue(mockData);

    render(<CompraDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('Orden urgente')).toBeInTheDocument();
    });
  });

  it('debe mostrar correctamente el estatus Recibida', async () => {
    const mockData = {
      id: '1',
      folio: 'OC-2026-0001',
      razonSocial: 'Proveedor Test',
      fecha: '2026-01-15',
      total: 500,
      impuestos: 80,
      estatus: 'RECIBIDA',
      moneda: 'MXN',
      condicionesPago: '',
      notas: '',
      detalles: [],
    };

    (get as jest.Mock).mockResolvedValue(mockData);

    render(<CompraDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getAllByText('Recibida').length).toBeGreaterThan(0);
    });
  });
});
