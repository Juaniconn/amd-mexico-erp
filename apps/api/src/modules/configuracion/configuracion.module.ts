import { Module } from '@nestjs/common';
import { ConfiguracionController } from './configuracion.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionController],
})
export class ConfiguracionModule {}
