import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tipo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unidad: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockMinimo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costoUnitario?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  moneda?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  tipo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidad?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockMinimo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costoUnitario?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  moneda?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['activo', 'inactivo'])
  estatus?: string;
}
