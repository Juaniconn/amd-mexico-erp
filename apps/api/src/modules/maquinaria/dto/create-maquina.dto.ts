import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateMaquinaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tipo: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  capacidad?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  intervaloDiasPreventivo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tarifaHora?: number;
}

export class UpdateMaquinaDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  tipo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  capacidad?: string;

  @IsUUID()
  @IsOptional()
  sucursalId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  intervaloDiasPreventivo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tarifaHora?: number;
}

export class AsignarOperadorDto {
  @IsUUID()
  @IsNotEmpty()
  operadorId: string;

  @IsUUID()
  @IsOptional()
  operadorId2?: string;
}

export class CreateMantenimientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tipo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descripcion: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costo?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  proveedor?: string;
}

export class UpdateEstatusMaquinaDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['ACTIVA', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO', 'RETIRADA'])
  estatus: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  razon?: string;
}
