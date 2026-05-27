import { IsArray, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class SaveOnboardingDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningStyles?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  dailyHours?: number;

  @IsOptional()
  @IsString()
  mainGoal?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studyTimes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  challenges?: string[];
}
