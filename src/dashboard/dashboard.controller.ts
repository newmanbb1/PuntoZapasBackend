import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard-stats')
  @CacheTTL(300000) // 5 minutes (in milliseconds)
  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }
}
