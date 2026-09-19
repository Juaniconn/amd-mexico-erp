import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleCotizacionDto {
  @IsString()
  @IsNotEmpty()
  piezaNombre: string;

  @IsString()
  @IsOptional()
  piezaDescripcion?: string;

  @IsNumber()
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

export class CreateCotizacionDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  validez?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCotizacionDto)
  detalles: DetalleCotizacionDto[];
}

export class UpdateCotizacionDto {
  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  validez?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DetalleCotizacionDto)
  detalles?: DetalleCotizacionDto[];

  @IsString()
  @IsOptional()
  @IsEnum(['borrador', 'enviada', 'aceptada', 'rechazada', 'cancelada'])
  estatus?: string;
}
