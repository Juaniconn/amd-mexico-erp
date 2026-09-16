import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, MaxLength, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  razonSocial: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  rfc?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  contacto?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ciudad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  estado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  codigoPostal?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  pais?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  creditoLimite?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  diasCredito?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  monedaPref?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
