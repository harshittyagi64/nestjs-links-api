import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({
    description: 'Original URL to shorten',
    example: 'https://nestjs.com',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^https?:\/\//i, {
    message: 'long_url must start with http:// or https://',
  })
  long_url: string;

  @ApiPropertyOptional({
    description: 'Optional expiration date',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiPropertyOptional({
    description: 'Optional tags',
    example: ['nestjs', 'backend'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @MaxLength(20, { each: true })
  tags?: string[];
} 