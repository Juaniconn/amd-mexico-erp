import { Module } from '@nestjs/common';
import { IngenieriaService } from './ingenieria.service';
import { IngenieriaController } from './ingenieria.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IngenieriaController],
  providers: [IngenieriaService],
  exports: [IngenieriaService],
})
export class IngenieriaModule {}
