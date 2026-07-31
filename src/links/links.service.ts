import { UpdateLinkDto } from './dto/update-link.dto';
import {
  ClickLog,
  LinkAnalytics,
} from './interfaces/click-log.interface';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { CreateLinkDto } from './dto/create-link.dto';
import { randomBytes } from 'crypto';
import { CacheService } from '../cache/cache.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { LinkEntity } from './entities/link.entity';
import { ClickLogEntity } from './entities/click-log.entity';
import * as QRCode from 'qrcode';


export interface Link {
  id: number;
  code: string;
  long_url: string;
  principal_id: string;
  created_at: Date;
  expires_at?: Date | null;
  tags?: string[];
  domain?: string;

  clicks_count?: number;
  last_accessed_at?: Date;
  logs?: ClickLog[];
  password?: string;
}

@Injectable()
export class LinksService {
  private links: Link[] = [];
constructor(
  @InjectRepository(LinkEntity)
  private readonly linkRepository: Repository<LinkEntity>,

  @InjectRepository(ClickLogEntity)
  private readonly clickLogRepository: Repository<ClickLogEntity>,

  private readonly cacheService: CacheService,
  private readonly webhooksService: WebhooksService,
) {}
private generateShortCode(): string {
  return randomBytes(4).toString('hex');
}


async verifyPassword(
  code: string,
  submittedPassword: string,
): Promise<boolean> {

  const link = await this.findByCode(code);

  if (!link.password) {
    return false;
  }

  return link.password === submittedPassword;
}


async generateQrCode(
  code: string,
  baseUrl: string,
  format: 'png' | 'svg' = 'png',
  width: number = 300,
  margin: number = 2,
): Promise<{ data: Buffer | string; contentType: string }> {

  const fullShortUrl = `${baseUrl}/r/${code}`;

  if (format === 'svg') {

    const svgString = await QRCode.toString(
      fullShortUrl,
      {
        type: 'svg',
        width,
        margin,
      },
    );

    return {
      data: svgString,
      contentType: 'image/svg+xml',
    };
  }


  const pngBuffer = await QRCode.toBuffer(
    fullShortUrl,
    {
      width,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    },
  );


  return {
    data: pngBuffer,
    contentType: 'image/png',
  };
}


/**
 * Check link expiration
 */
isExpired(link: Link): boolean {
  if (!link.expires_at) return false;

  return new Date() > new Date(link.expires_at);
}
  

  /**
   * Create new short link
   * Supports:
   * - normal random code
   * - custom vanity alias
   * - expiration date
   */
  async create(
  createLinkDto: CreateLinkDto,
  principalId: string,
) {

  // YAHAN ADD KARNA HAI 👇

  if (createLinkDto.custom_code) {

    const exists = this.links.find(
      (link) =>
        link.code === createLinkDto.custom_code &&
        link.domain === (
          createLinkDto.domain
            ? createLinkDto.domain.toLowerCase()
            : undefined
        ),
    );

    if (exists) {
      throw new ConflictException(
        'Short code already exists for this domain',
      );
    }
  }


  // Iske baad tera existing code chalega

  const code =
    createLinkDto.custom_code ||
    this.generateShortCode();


  const link: Link = {

    password:
      createLinkDto.password || undefined,

    id:
      this.links.length + 1,

    code,

    long_url:
      createLinkDto.long_url,

    principal_id:
      principalId,

    created_at:
      new Date(),

    expires_at:
      createLinkDto.expires_at
        ? new Date(createLinkDto.expires_at)
        : undefined,

    tags:
      createLinkDto.tags || [],

    domain:
      createLinkDto.domain
        ? createLinkDto.domain.toLowerCase()
        : undefined,
  };


  this.links.push(link);
  await this.webhooksService.dispatch(
  principalId,
  'link.created',
  link,
);

  return link;
}


async findPaginated(
  principalId: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  tag?: string,
) {
  let userLinks = this.links.filter(
    (link) =>
      link.principal_id === principalId,
  );


  if (search) {
    const query = search.toLowerCase();

    userLinks = userLinks.filter(
      (link) =>
        link.code.toLowerCase().includes(query) ||
        link.long_url.toLowerCase().includes(query),
    );
  }


  if (tag) {
    const targetTag = tag.toLowerCase();

    userLinks = userLinks.filter((link) =>
      link.tags?.some(
        (t) => t.toLowerCase() === targetTag,
      ),
    );
  }


  const total = userLinks.length;

  const totalPages =
    Math.ceil(total / limit) || 1;


  const startIndex =
    (page - 1) * limit;


  const data =
    userLinks.slice(
      startIndex,
      startIndex + limit,
    );


  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}


  findOne(
    id: number,
    principalId: string,
  ) {
    const link =
      this.links.find(
        (item) =>
          item.id === id &&
          item.principal_id === principalId,
      );


    if (!link) {
      throw new NotFoundException(
        'Link not found',
      );
    }

    return link;
  }
async findByCode(code: string) {
  const link = await this.linkRepository.findOne({
    where: { code },
  });

  if (!link) {
    throw new NotFoundException('Short URL not found');
  }

  return link;
}
  

  async update(
  id: number,
  principalId: string,
  updateData: UpdateLinkDto,
) {
  const link = this.links.find(
    (item) =>
      item.id === id &&
      item.principal_id === principalId,
  );

  if (!link) {
    throw new NotFoundException(
      'Link not found',
    );
  }

  if (updateData.long_url !== undefined) {
    link.long_url = updateData.long_url;
  }

  if (updateData.expires_at !== undefined) {
    link.expires_at = updateData.expires_at
      ? new Date(updateData.expires_at)
      : undefined;
      if (updateData.tags !== undefined) {
  link.tags = updateData.tags;
}
  }

  await this.cacheService.invalidateRedirectTarget(
    link.code,
  );

  return link;
}


  async remove(
    id: number,
    principalId: string,
  ) {
    const index =
      this.links.findIndex(
        (item) =>
          item.id === id &&
          item.principal_id === principalId,
      );


    if (index === -1) {
      throw new NotFoundException(
        'Link not found',
      );
    }


    const deletedLink =
      this.links[index];


    this.links.splice(
      index,
      1,
    );


    await this.cacheService.invalidateRedirectTarget(
      deletedLink.code,
    );
  }



    private detectDeviceType(
    ua?: string,
  ): 'desktop' | 'mobile' | 'bot' | 'other' {

    if (!ua) return 'other';

    const lower = ua.toLowerCase();


    if (
      lower.includes('bot') ||
      lower.includes('crawler') ||
      lower.includes('spider')
    ) {
      return 'bot';
    }


    if (
      lower.includes('mobile') ||
      lower.includes('android') ||
      lower.includes('iphone')
    ) {
      return 'mobile';
    }


    if (
      lower.includes('mozilla') ||
      lower.includes('chrome') ||
      lower.includes('safari') ||
      lower.includes('windows') ||
      lower.includes('macintosh')
    ) {
      return 'desktop';
    }


    return 'other';
  }



  async recordClick(
    linkId: number,
    userAgent?: string,
    referrer?: string,
  ): Promise<void> {
    const link = await this.linkRepository.findOne({ where: { id: linkId } });
    if (!link) return;

    link.clicks_count += 1;
    await this.linkRepository.save(link);

    const deviceType = this.detectDeviceType(userAgent);

    // Save click log entry to PostgreSQL database
    const log = this.clickLogRepository.create({
      link_id: linkId,
      device_type: deviceType,
      referrer: referrer || 'direct',
      user_agent: userAgent,
    });
    await this.clickLogRepository.save(log);

    await this.webhooksService.dispatch(link.principal_id, 'link.clicked', {
      link_id: linkId,
      code: link.code,
      clicks_count: link.clicks_count,
      device_type: deviceType,
      referrer: referrer || 'direct',
    });
  }
  
  async getAnalytics(linkId: number, principalId?: string) {
    const link = await this.linkRepository.findOne({ where: { id: linkId } });
    if (!link) return null;

    // Fetch click logs directly from PostgreSQL repository
    const logs = await this.clickLogRepository.find({
      where: { link_id: linkId },
      order: { createdAt: 'DESC' },
    });

    const deviceBreakdown = { desktop: 0, mobile: 0, bot: 0, other: 0 };
    const referrerMap: Record<string, number> = {};

    for (const log of logs) {
      if (log.device_type in deviceBreakdown) {
        deviceBreakdown[log.device_type]++;
      }
      const ref = log.referrer || 'direct';
      referrerMap[ref] = (referrerMap[ref] || 0) + 1;
    }

    return {
      link_id: link.id,
      code: link.code,
      total_clicks: link.clicks_count,
      by_device: deviceBreakdown,
      top_referrers: referrerMap,
      recent_clicks: logs.slice(0, 10),
    };
  }
  async createBulk(
  principalId: string,
  links: CreateLinkDto[],
): Promise<Link[]> {

  const createdLinks: Link[] = [];

  for (const dto of links) {

    const link = await this.create(
      dto,
      principalId,
    );

    createdLinks.push(link);
  }

  return createdLinks;
}


// ADD THIS AFTER createBulk

async getLinkStats(
  id: number,
  principalId: string,
) {

  const link = this.links.find(
    (l) =>
      l.id === id &&
      l.principal_id === principalId,
  );


  if (!link) {
    throw new NotFoundException(
      'Link not found',
    );
  }


  return {
    id: link.id,
    code: link.code,
    long_url: link.long_url,
    clicks_count: link.clicks_count || 0,
    last_accessed_at: link.last_accessed_at,
    logs: link.logs || [],
  };
}
}


