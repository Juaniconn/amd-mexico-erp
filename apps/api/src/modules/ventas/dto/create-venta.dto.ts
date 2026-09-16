import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VentaItemDto {
  @IsString()
  @IsNotEmpty()
  piezaNombre: string;

  @IsString()
  @IsOptional()
  piezaDescripcion?: string;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  unidad: string;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tiempoEstimado?: number;

  @IsString()
  @IsOptional()
  procesoRequerido?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}

export class CreateVentaDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  items: VentaItemDto[];
}

export class UpdateVentaDto {
  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['COTIZACION', 'PENDIENTE', 'APROBADA', 'EN_PRODUCCION', 'COMPLETADA', 'CANCELADA'])
  estatus?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  items?: VentaItemDto[];
}
