import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class AsignarParteDto {
  @IsUUID()
  @IsNotEmpty()
  operadorId: string;

  @IsUUID()
  @IsOptional()
  maquinaId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}
