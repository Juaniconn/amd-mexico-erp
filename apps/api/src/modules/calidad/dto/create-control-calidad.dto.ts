import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateControlCalidadDto {
  @IsUUID()
  @IsNotEmpty()
  operacionId: string;

  @IsUUID()
  @IsOptional()
  ordenTrabajoId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  resultado: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  defectos?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observaciones?: string;
}

export class UpdateControlCalidadDto {
  @IsString()
  @IsOptional()
  @IsEnum(['aprobado', 'rechazado', 'rework'])
  resultado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  defectos?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observaciones?: string;
}
