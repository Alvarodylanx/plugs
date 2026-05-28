import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResearchService } from './research.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get('wiki/search')
  search(@Query('q') q: string) {
    if (!q?.trim()) return [];
    return this.researchService.searchWikipedia(q.trim());
  }

  @Get('wiki/article')
  article(@Query('title') title: string) {
    return this.researchService.getWikipediaArticle(title);
  }
}
