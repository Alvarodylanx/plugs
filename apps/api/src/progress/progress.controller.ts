import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get()
  getDashboard(@Request() req: any) { return this.progressService.getDashboard(req.user.id); }

  @Get('activity')
  getActivity(@Request() req: any) { return this.progressService.getRecentActivity(req.user.id); }
}
