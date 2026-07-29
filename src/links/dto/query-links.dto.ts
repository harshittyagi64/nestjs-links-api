import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLinksDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;


  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;


  @ApiPropertyOptional({
    description: 'Search by code or URL',
    example: 'nestjs',
  })
  @IsOptional()
  @IsString()
  search?: string;

@ApiPropertyOptional({
  description: 'Filter links by specific tag',
  example: 'marketing',
})
@IsOptional()
@IsString()
tag?: string;
}
