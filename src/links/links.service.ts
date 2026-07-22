import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { randomBytes } from 'crypto';

export interface Link {
  id: number;
  code: string;
  long_url: string;
  created_at: Date;
}

@Injectable()
export class LinksService {

  private links: Link[] = [];

  private generateShortCode(): string {
    return randomBytes(4).toString('hex');
  }

  create(createLinkDto: CreateLinkDto) {

    const code = this.generateShortCode();

    const link: Link = {
      id: this.links.length + 1,
      code,
      long_url: createLinkDto.long_url,
      created_at: new Date(),
    };

    this.links.push(link);

    return link;
  }


  findAll(page: number, limit: number) {
    return {
      page,
      limit,
      data: this.links,
    };
  }


  findOne(id: string) {

    const link = this.links.find(
      (item) => item.id === Number(id)
    );

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return link;
  }


  findByCode(code: string) {

    const link = this.links.find(
      (item) => item.code === code
    );

    if (!link) {
      throw new NotFoundException('Short URL not found');
    }

    return link;
  }
}