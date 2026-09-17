import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateEstatusParteDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'PENDIENTE',
    'EN_PROCESO',
    'COMPLETADA',
    'EN_INSPECCION',
    'APROBADA',
    'RECHAZADA',
    'PAUSADA',
    'EN_ESPERA_MATERIAL',
  ])
  estatus: string;
}
