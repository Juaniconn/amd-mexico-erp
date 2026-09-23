import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, Min, MaxLength } from 'class-validator';

export class CreateDetalleFacturaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  descripcion: string;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsNumber()
  @Min(0)
  importe: number;
}

export class CreateFacturaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  folio: string;

  @IsString()
  @IsNotEmpty()
  clienteId: string;

  @IsString()
  @IsOptional()
  cotizacionId?: string;

  @IsString()
  @IsOptional()
  ordenTrabajoId?: string;

  @IsDateString()
  fechaFactura: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsEnum(['PENDIENTE', 'PAGADA', 'VENCIDA', 'CANCELADA'])
  @IsOptional()
  estatus?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  impuestos?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  total?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsString()
  @IsNotEmpty()
  creadoPorId: string;

  @IsOptional()
  detalles?: CreateDetalleFacturaDto[];
}

export class UpdateFacturaDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  folio?: string;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsDateString()
  @IsOptional()
  fechaFactura?: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsEnum(['PENDIENTE', 'PAGADA', 'VENCIDA', 'CANCELADA'])
  @IsOptional()
  estatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}
