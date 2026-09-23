import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateOperacionDto {
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
