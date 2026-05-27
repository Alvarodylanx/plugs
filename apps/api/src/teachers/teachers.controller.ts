import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeachersService } from './teachers.service';

@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('me')
  getMyProfile(@Request() req: any) {
    return this.teachersService.getMyProfile(req.user.id);
  }

  @Post('profile')
  createProfile(@Request() req: any, @Body() body: any) {
    return this.teachersService.createOrUpdateProfile(req.user.id, body);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.teachersService.createOrUpdateProfile(req.user.id, body);
  }

  @Get()
  findAll(@Query('subject') subject?: string, @Query('town') town?: string) {
    return this.teachersService.findAll(subject, town);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.teachersService.findOne(id, req.user.id);
  }

  @Post(':id/follow')
  follow(@Request() req: any, @Param('id') id: string) {
    return this.teachersService.follow(req.user.id, id);
  }

  @Post(':id/rate')
  rate(@Request() req: any, @Param('id') id: string, @Body() body: { rating: number }) {
    return this.teachersService.rateTeacher(req.user.id, id, body.rating);
  }
}
