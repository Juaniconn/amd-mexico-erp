import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' as const } },
            { apellido: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          nombre: true,
          apellido: true,
          role: true,
          activo: true,
          ultimoAcceso: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data: usuarios,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        role: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return usuario;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async create(dto: CreateUsuarioDto) {
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    const existingUsername = await this.prisma.usuario.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        username: dto.username,
        nombre: dto.nombre,
        apellido: dto.apellido,
        passwordHash,
        role: dto.role ?? Role.OPERADOR,
      },
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        role: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    if (dto.email) {
      const existingEmail = await this.prisma.usuario.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existingEmail) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    if (dto.username) {
      const existingUsername = await this.prisma.usuario.findFirst({
        where: { username: dto.username, NOT: { id } },
      });
      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
    }

    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        role: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return usuario;
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateRole(id: string, role: Role) {
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePassword(id: string, password: string) {
    if (!password || password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    await this.findOne(id);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    return this.prisma.usuario.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        email: true,
        username: true,
        nombre: true,
        apellido: true,
        role: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
