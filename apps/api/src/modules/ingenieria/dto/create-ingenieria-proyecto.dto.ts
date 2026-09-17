import { IsString, IsOptional, IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateIngenieriaProyectoDto {
  @IsNotEmpty()
  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateIngenieriaProyectoDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
