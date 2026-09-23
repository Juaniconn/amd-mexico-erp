import { Module } from '@nestjs/common';
import { EmbarquesService } from './embarques.service';
import { EmbarquesController } from './embarques.controller';
import { PrismaModule } from '../../database/prisma.module';
import { FacturacionModule } from '../facturacion/facturacion.module';

@Module({
  imports: [PrismaModule, FacturacionModule],
  controllers: [EmbarquesController],
  providers: [EmbarquesService],
  exports: [EmbarquesService],
})
export class EmbarquesModule {}
