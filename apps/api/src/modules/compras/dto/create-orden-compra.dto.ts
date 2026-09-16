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
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrdenCompraProveedorDto {
  @IsUUID()
  @IsNotEmpty()
  proveedorId: string;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}

export class CreateOrdenCompraDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @IsUUID()
  @IsOptional()
  cotizacionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  condicionesPago?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrdenCompraProveedorDto)
  proveedores: OrdenCompraProveedorDto[];
}

export class UpdateOrdenCompraDto {
  @IsString()
  @IsOptional()
  @IsEnum(['pendiente', 'aprobada', 'en_produccion', 'completada', 'cancelada'])
  estatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  condicionesPago?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}
