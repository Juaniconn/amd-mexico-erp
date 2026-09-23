import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBomItemDto {
  @IsUUID()
  @IsNotEmpty()
  materialId: string;

  @IsNumber()
  @Min(0.001)
  cantidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidad?: string;

  @IsUUID()
  @IsOptional()
  parteId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string;
}

export class UpdateBomItemDto {
  @IsUUID()
  @IsOptional()
  materialId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.001)
  cantidad?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidad?: string;

  @IsUUID()
  @IsOptional()
  parteId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notas?: string | null;
}

export class ReplaceBomDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => CreateBomItemDto)
  items: CreateBomItemDto[];
}
