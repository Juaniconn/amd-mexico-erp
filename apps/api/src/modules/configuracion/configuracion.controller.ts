import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('configuracion/sucursales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR, Role.PRODUCCION, Role.CALIDAD, Role.COMPRAS, Role.OPERADOR)
  async findAll() {
    return this.prisma.sucursal.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        ciudad: true,
        estado: true,
        pais: true,
        monedaDefault: true,
        esPrincipal: true,
        activo: true,
      },
    });
  }
}
