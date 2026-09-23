import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosController, PermisosController],
  providers: [UsuariosService, PermisosService],
  exports: [UsuariosService, PermisosService],
})
export class UsuariosModule {}
