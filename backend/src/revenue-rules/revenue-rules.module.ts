import { Module } from '@nestjs/common';
import { RevenueRulesService } from './revenue-rules.service';
import { RevenueRulesController } from './revenue-rules.controller';

@Module({
  providers: [RevenueRulesService],
  controllers: [RevenueRulesController],
  exports: [RevenueRulesService],
})
export class RevenueRulesModule {}
