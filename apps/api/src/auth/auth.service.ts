import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hash, level: dto.level },
    });

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user);
  }

  async updateProfile(userId: string, dto: { name?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...(dto.name ? { name: dto.name } : {}) },
      select: { id: true, name: true, email: true, level: true, points: true, streak: true },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, level: true, points: true, streak: true, createdAt: true },
    });
  }

  private async signToken(user: any) {
    const payload = { sub: user.id, email: user.email, name: user.name };
    const token = await this.jwt.signAsync(payload);
    return { token, user: { id: user.id, name: user.name, email: user.email, level: user.level, points: user.points, streak: user.streak } };
  }
}
