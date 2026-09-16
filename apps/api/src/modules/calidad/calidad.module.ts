import { Module } from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CalidadController } from './calidad.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CalidadController],
  providers: [CalidadService],
  exports: [CalidadService],
})
export class CalidadModule {}
