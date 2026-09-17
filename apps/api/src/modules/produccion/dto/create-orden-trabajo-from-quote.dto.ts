import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateOrdenTrabajoFromQuoteDto {
  @IsUUID()
  @IsNotEmpty()
  cotizacionId: string;

  @IsUUID()
  @IsOptional()
  responsableId?: string;
}
