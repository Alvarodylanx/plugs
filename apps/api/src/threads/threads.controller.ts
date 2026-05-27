import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThreadsService } from './threads.service';

@UseGuards(JwtAuthGuard)
@Controller('threads')
export class ThreadsController {
  constructor(private threadsService: ThreadsService) {}

  @Get()
  findAll(@Request() req: any, @Query('subject') subject?: string, @Query('sort') sort?: any) {
    return this.threadsService.findAll(req.user.id, subject, sort);
  }

  @Get('leaderboard')
  leaderboard() { return this.threadsService.getLeaderboard(); }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) { return this.threadsService.findOne(id, req.user.id); }

  @Post()
  create(@Request() req: any, @Body() body: any) { return this.threadsService.create(req.user.id, body); }

  @Post(':id/like')
  like(@Request() req: any, @Param('id') id: string) { return this.threadsService.toggleLike(req.user.id, id); }

  @Post(':id/reply')
  reply(@Request() req: any, @Param('id') threadId: string, @Body() body: { content: string }) {
    return this.threadsService.addReply(req.user.id, threadId, body.content);
  }

  @Post('replies/:id/like')
  likeReply(@Request() req: any, @Param('id') id: string) { return this.threadsService.toggleReplyLike(req.user.id, id); }

  @Patch('replies/:id/best-answer')
  markBestAnswer(@Request() req: any, @Param('id') id: string) {
    return this.threadsService.markBestAnswer(req.user.id, id);
  }
}
