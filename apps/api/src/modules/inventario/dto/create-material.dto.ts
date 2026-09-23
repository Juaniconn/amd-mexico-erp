import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  categoria?: string;

  @IsEnum(['pieza', 'kg', 'm', 'litro', 'set', 'caja', 'par', 'PZA', 'KG', 'M', 'L'])
  @IsOptional()
  unidad?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockActual?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockMinimo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  precioUnitario?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  ubicacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  categoria?: string;

  @IsEnum(['pieza', 'kg', 'm', 'litro', 'set', 'caja', 'par', 'PZA', 'KG', 'M', 'L'])
  @IsOptional()
  unidad?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockMinimo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  precioUnitario?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  ubicacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsOptional()
  activo?: boolean;
}

export class CreateMovimientoDto {
  @IsEnum(['ENTRADA', 'SALIDA', 'AJUSTE'])
  tipo: string;

  @IsNumber()
  @Min(0.001)
  cantidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  documentoRef?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}
