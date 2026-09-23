import { Module } from '@nestjs/common';
import { VpsController } from './vps/vps.controller';
import { VpsService } from './vps/vps.service';

@Module({
  controllers: [VpsController],
  providers: [VpsService],
})
export class VpsModule {}
