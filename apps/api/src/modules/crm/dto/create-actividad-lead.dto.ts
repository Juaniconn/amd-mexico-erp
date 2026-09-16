import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateActividadLeadDto {
  @IsUUID()
  @IsNotEmpty()
  leadId: string;

  @IsOptional()
  @IsEnum(['NOTA', 'LLAMADA', 'EMAIL', 'REUNION', 'TAREA'])
  tipo?: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
