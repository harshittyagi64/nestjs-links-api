import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayMaxSize, ValidateNested, IsArray } from 'class-validator';
import { CreateLinkDto } from './create-link.dto';

export class CreateBulkLinksDto {
  @ApiProperty({
    type: [CreateLinkDto],
    description: 'Array of link creation objects (maximum 100 links per batch)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateLinkDto)
  links: CreateLinkDto[];
}