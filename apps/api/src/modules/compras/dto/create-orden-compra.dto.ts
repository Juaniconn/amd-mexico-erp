import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
  IsUUID,
  ValidateNested,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetalleOrdenCompraDto {
  @IsUUID()
  @IsNotEmpty()
  materialId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsNumber()
  @Min(0.001)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;
}

export class CreateOrdenCompraDto {
  @IsUUID()
  @IsOptional()
  proveedorId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  condicionesPago?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleOrdenCompraDto)
  detalles: CreateDetalleOrdenCompraDto[];
}

export class UpdateOrdenCompraDto {
  @IsUUID()
  @IsOptional()
  proveedorId?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  condicionesPago?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notas?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleOrdenCompraDto)
  detalles?: CreateDetalleOrdenCompraDto[];
}
