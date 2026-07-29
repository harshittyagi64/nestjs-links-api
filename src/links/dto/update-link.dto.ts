import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  IsISO8601,
  IsArray,
  IsFQDN,
} from 'class-validator';

export class UpdateLinkDto {

  @ApiPropertyOptional({
    description: 'Updated target URL',
    example: 'https://nestjs.com/docs',
  })
  @IsOptional()
  @IsUrl()
  long_url?: string;


  @ApiPropertyOptional({
    description: 'Updated expiration timestamp',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsISO8601()
  expires_at?: string;


  @ApiPropertyOptional({
    description: 'Updated tags for organizing links',
    example: ['marketing', 'launch'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];


  @ApiPropertyOptional({
    description: 'Updated password requirement',
    example: 'Secret123!',
  })
  @IsOptional()
  @IsString()
  password?: string;


  // MODULE 19: Custom Domain Support
  @ApiPropertyOptional({
    description: 'Updated custom branded domain name',
    example: 'link.brand.io',
  })
  @IsOptional()
  @IsString()
  @IsFQDN({}, {
    message: 'Domain must be a valid domain name',
  })
  domain?: string;

}