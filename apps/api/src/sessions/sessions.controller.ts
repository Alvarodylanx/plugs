import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  findAll(@Request() req: any) { return this.sessionsService.findAll(req.user.id); }

  @Post()
  create(@Request() req: any, @Body() body: any) { return this.sessionsService.create(req.user.id, body); }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) { return this.sessionsService.update(id, req.user.id, body); }

  @Patch(':id/toggle')
  toggle(@Request() req: any, @Param('id') id: string) { return this.sessionsService.toggleComplete(id, req.user.id); }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) { return this.sessionsService.delete(id, req.user.id); }
}
