import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordDto {
  @ApiProperty({
    description: 'Password required to unlock the short link',
    example: 'Secret123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}