import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cost } from '../../database/entities/cost.entity';
import { CostHistory } from '../../database/entities/cost-history.entity';
import { CostsController } from './costs.controller';
import { CostsService } from './costs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cost, CostHistory])],
  controllers: [CostsController],
  providers: [CostsService],
  exports: [CostsService],
})
export class CostsModule {}
