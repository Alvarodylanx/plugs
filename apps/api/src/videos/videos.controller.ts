import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('maxResults') maxResults?: string,
  ) {
    if (!q?.trim()) return [];
    return this.videosService.search(q.trim(), maxResults ? parseInt(maxResults, 10) : 6);
  }
}
