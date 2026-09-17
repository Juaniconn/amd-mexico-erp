import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UploadPlanoDto {
  @IsString()
  parteNumero: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
