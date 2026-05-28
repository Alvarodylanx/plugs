import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  findAll(@Request() req: any, @Query('subject') subject?: string) {
    return this.notesService.findAll(req.user.id, subject);
  }

  @Post('summarize')
  summarize(@Body() body: { text: string; subject: string; level: string; tags: string[] }) {
    return this.notesService.summarize(body.text, body.subject, body.level, body.tags || []);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.notesService.create(req.user.id, body);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.notesService.delete(id, req.user.id);
  }

  @Post(':id/read/:sectionIdx')
  markRead(@Request() req: any, @Param('id') noteId: string, @Param('sectionIdx') idx: string) {
    return this.notesService.markSectionRead(req.user.id, noteId, parseInt(idx));
  }

  @Get(':id/progress')
  getProgress(@Request() req: any, @Param('id') noteId: string) {
    return this.notesService.getReadProgress(req.user.id, noteId);
  }

  @Post(':id/quiz-result')
  saveQuizResult(@Request() req: any, @Param('id') noteId: string, @Body() body: { score: number; total: number }) {
    return this.notesService.saveQuizResult(req.user.id, noteId, body.score, body.total);
  }

  @Get(':id/quiz-results')
  getQuizResults(@Request() req: any, @Param('id') noteId: string) {
    return this.notesService.getQuizResults(req.user.id, noteId);
  }
}
