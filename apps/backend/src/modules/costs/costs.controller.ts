import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CostsService } from './costs.service';
import { ListCostQueryDto } from './dto/list-cost.query.dto';
import { CreateCostHistoryDto } from './dto/create-cost-history.dto';

@UseGuards(JwtAuthGuard)
@Controller('costs')
export class CostsController {
  constructor(private readonly svc: CostsService) {}

  @Get('history')
  async listHistory(@Query() q: ListCostQueryDto) {
    return this.svc.listHistory(q);
  }

  @Get('latest')
  async listLatest() {
    return this.svc.listLatest();
  }

  @Get('options')
  async options() {
    return this.svc.options();
  }

  @Post('history')
  async insert(@Body() dto: CreateCostHistoryDto) {
    return this.svc.insertPriceChange(dto);
  }
}
