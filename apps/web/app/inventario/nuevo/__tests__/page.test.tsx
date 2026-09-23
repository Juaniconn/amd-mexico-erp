import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NuevoMaterialPage from '../page';
import { post } from '@/lib/api';

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

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/inventario/nuevo',
    useParams: () => ({ id: 'new' }),
    notFound: jest.fn(),
    redirect: jest.fn(),
    permanentRedirect: jest.fn(),
  };
});

describe('NuevoMaterialPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el formulario de crear material', () => {
    render(<NuevoMaterialPage />);

    expect(screen.getByText('Nuevo Material')).toBeInTheDocument();
    expect(screen.getByText('Complete los datos del material')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MAT-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre del material')).toBeInTheDocument();
  });

  it('debe mostrar campos del formulario', () => {
    render(<NuevoMaterialPage />);

    expect(screen.getByText('Código *')).toBeInTheDocument();
    expect(screen.getByText('Nombre *')).toBeInTheDocument();
    expect(screen.getByText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Stock Mínimo')).toBeInTheDocument();
    expect(screen.getByText('Costo Unitario')).toBeInTheDocument();
    expect(screen.getByText('Moneda')).toBeInTheDocument();
    expect(screen.getByText('Notas')).toBeInTheDocument();
  });

  it('debe permitir ingresar datos en el formulario', () => {
    render(<NuevoMaterialPage />);

    const codigoInput = screen.getByPlaceholderText('MAT-001');
    const nombreInput = screen.getByPlaceholderText('Nombre del material');

    fireEvent.change(codigoInput, { target: { value: 'MAT-003' } });
    fireEvent.change(nombreInput, { target: { value: 'Nuevo material' } });

    expect(codigoInput).toHaveValue('MAT-003');
    expect(nombreInput).toHaveValue('Nuevo material');
  });

  it('debe crear material exitosamente', async () => {
    (post as jest.Mock).mockResolvedValue({ id: 'new-id' });

    render(<NuevoMaterialPage />);

    const codigoInput = screen.getByPlaceholderText('MAT-001');
    const nombreInput = screen.getByPlaceholderText('Nombre del material');

    fireEvent.change(codigoInput, { target: { value: 'MAT-NEW' } });
    fireEvent.change(nombreInput, { target: { value: 'Material nuevo' } });

    const submitButton = screen.getByText('Crear Material');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/api/inventario/materiales', expect.objectContaining({
        codigo: 'MAT-NEW',
        nombre: 'Material nuevo',
      }));
    });
  });

  it('debe mostrar error si falla la creación', async () => {
    (post as jest.Mock).mockRejectedValue(new Error('Error al crear el material'));

    render(<NuevoMaterialPage />);

    const codigoInput = screen.getByPlaceholderText('MAT-001');
    const nombreInput = screen.getByPlaceholderText('Nombre del material');

    fireEvent.change(codigoInput, { target: { value: 'MAT-NEW' } });
    fireEvent.change(nombreInput, { target: { value: 'Material nuevo' } });

    const submitButton = screen.getByText('Crear Material');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error al crear el material/i)).toBeInTheDocument();
    });
  });
});
