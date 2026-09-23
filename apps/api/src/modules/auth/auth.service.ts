import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    // Cargar permisos del usuario
    const permisos = await this.prisma.usuarioPermiso.findMany({
      where: { usuarioId: user.id },
    });

    const permisosMap: Record<string, string[]> = {};
    if (user.role === 'ADMIN') {
      // Admin tiene todos los permisos
      permisosMap['*'] = ['*'];
    } else {
      for (const p of permisos) {
        if (p.permitido) {
          if (!permisosMap[p.modulo]) permisosMap[p.modulo] = [];
          permisosMap[p.modulo].push(p.accion);
        }
      }
    }

    const userFull = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      include: { sucursal: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sucursalId: user.sucursalId,
      permisos: permisosMap,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      },
    );

    const { passwordHash, ...userWithoutPassword } = userFull || user;

    return {
      user: { ...userWithoutPassword, permisos: permisosMap },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.activo) {
        throw new UnauthorizedException('Token inválido');
      }

      // Cargar permisos del usuario
      const permisos = await this.prisma.usuarioPermiso.findMany({
        where: { usuarioId: user.id },
      });

      const permisosMap: Record<string, string[]> = {};
      if (user.role === 'ADMIN') {
        permisosMap['*'] = ['*'];
      } else {
        for (const p of permisos) {
          if (p.permitido) {
            if (!permisosMap[p.modulo]) permisosMap[p.modulo] = [];
            permisosMap[p.modulo].push(p.accion);
          }
        }
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role, permisos: permisosMap };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      });

      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
          secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { sucursal: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Cargar permisos
    const permisos = await this.prisma.usuarioPermiso.findMany({
      where: { usuarioId: userId },
    });

    const permisosMap: Record<string, string[]> = {};
    if (user.role === 'ADMIN') {
      permisosMap['*'] = ['*'];
    } else {
      for (const p of permisos) {
        if (p.permitido) {
          if (!permisosMap[p.modulo]) permisosMap[p.modulo] = [];
          permisosMap[p.modulo].push(p.accion);
        }
      }
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, permisos: permisosMap };
  }
}
