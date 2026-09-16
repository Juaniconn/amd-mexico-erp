import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  IsUUID,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInteresLeadDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  cantidad?: number;

  @IsString()
  @IsOptional()
  notas?: string;
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  contactoNombre?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsOptional()
  @IsEnum(['REFERENCIA', 'WEB', 'LLAMADA', 'EMAIL', 'FERIA', 'OTRO'])
  origen?: string;

  @IsOptional()
  @IsEnum(['NUEVO', 'CONTACTADO', 'CALIFICADO', 'PROPUESTA', 'GANADO', 'PERDIDO'])
  estatus?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  valorEstimado?: number;

  @IsOptional()
  @IsEnum(['MXN', 'USD'])
  moneda?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tipoCambio?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsDateString()
  @IsOptional()
  fechaSeguimiento?: string;

  @IsDateString()
  @IsOptional()
  proximaAccion?: string;

  @IsUUID()
  @IsOptional()
  vendedorId?: string;

  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateInteresLeadDto)
  intereses?: CreateInteresLeadDto[];
}
