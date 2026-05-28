import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuikzService } from './quikz.service';

@UseGuards(JwtAuthGuard)
@Controller('quikz')
export class QuikzController {
  constructor(private quikzService: QuikzService) {}

  @Get('settings')
  getSettings(@Request() req: any) {
    return this.quikzService.getSettings(req.user.id);
  }

  @Post('settings')
  saveSettings(@Request() req: any, @Body() body: any) {
    return this.quikzService.saveSettings(req.user.id, body);
  }

  @Get('question')
  getQuestion(@Request() req: any) {
    return this.quikzService.getRandomQuestion(req.user.id);
  }

  @Post('answer')
  recordAnswer(@Request() req: any, @Body() body: { noteId: string; questionIdx: number; correct: boolean }) {
    return this.quikzService.recordAnswer(req.user.id, body.noteId, body.questionIdx, body.correct);
  }

  @Post('subscribe')
  subscribe(@Request() req: any, @Body() body: { subscription: any }) {
    return this.quikzService.savePushSubscription(req.user.id, body.subscription);
  }

  @Post('unsubscribe')
  unsubscribe(@Request() req: any) {
    return this.quikzService.removePushSubscription(req.user.id);
  }

  @Get('vapid-public-key')
  getVapidKey() {
    return { key: process.env.VAPID_PUBLIC_KEY || '' };
  }
}
