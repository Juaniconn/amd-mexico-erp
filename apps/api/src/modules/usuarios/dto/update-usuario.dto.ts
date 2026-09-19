import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre de usuario es requerido' })
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El usuario no puede exceder 50 caracteres' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido es requerido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido' })
  role?: Role;
}
