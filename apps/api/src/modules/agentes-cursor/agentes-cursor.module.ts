import { Module } from '@nestjs/common';
import { AgentesCursorController } from './agentes-cursor.controller';
import { CursorCloudService } from './cursor-cloud.service';

@Module({
  controllers: [AgentesCursorController],
  providers: [CursorCloudService],
  exports: [CursorCloudService],
})
export class AgentesCursorModule {}
