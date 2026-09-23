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

export class OperacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  proceso: string;

  @IsUUID()
  @IsOptional()
  maquinaId?: string;

  @IsUUID()
  @IsOptional()
  operadorId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tiempoEstimado?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  secuencia?: number;
}

export class CreateOrdenTrabajoDto {
  @IsUUID()
  @IsNotEmpty()
  ordenCompraId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  piezaNombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  piezaDescripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unidad: string;

  @IsString()
  @IsOptional()
  @IsEnum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])
  prioridad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OperacionDto)
  operaciones?: OperacionDto[];
}

export class UpdateOrdenTrabajoDto {
  @IsString()
  @IsOptional()
  @IsEnum(['PENDIENTE', 'EN_PRODUCCION', 'CALIDAD', 'COMPLETADA', 'CANCELADA'])
  estatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  cantidad?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])
  prioridad?: string;

  @IsString()
  @IsOptional()
  fechaInicio?: string;

  @IsString()
  @IsOptional()
  fechaFinEstimada?: string;
}

export class UpdateOperacionDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  tiempoReal?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'RECHAZADA'])
  estatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;

  @IsString()
  @IsOptional()
  fechaInicioProgramada?: string;

  @IsString()
  @IsOptional()
  fechaFinProgramada?: string;

  @IsUUID()
  @IsOptional()
  maquinaId?: string;
}
