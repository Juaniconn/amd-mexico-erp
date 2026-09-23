import { Module } from '@nestjs/common';
import { MaquinariaService } from './maquinaria.service';
import { MaquinariaController } from './maquinaria.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MaquinariaController],
  providers: [MaquinariaService],
  exports: [MaquinariaService],
})
export class MaquinariaModule {}
