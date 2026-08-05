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
import CircuitBreaker from 'opossum';
import { Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(LinksService.name);
private linkLookupBreaker: CircuitBreaker;
  private links: Link[] = [];
constructor(

  @InjectRepository(LinkEntity)
  private readonly linkRepository: Repository<LinkEntity>,

  @InjectRepository(ClickLogEntity)
  private readonly clickLogRepository: Repository<ClickLogEntity>,

  private readonly cacheService: CacheService,
  private readonly webhooksService: WebhooksService,
) {

  this.linkLookupBreaker = new CircuitBreaker(
    async (code: string) => {
      return this.linkRepository.findOne({
        where: { code },
      });
    },
    {
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      volumeThreshold: 5,
    },
  );


  this.linkLookupBreaker.fallback(
    (code: string) => {
      this.logger.warn(
        `circuit_open_fallback code=${code}`,
      );

      throw new Error(
        'Link service temporarily unavailable',
      );
    },
  );


  this.linkLookupBreaker.on(
    'open',
    () => {
      this.logger.error(
        'circuit_opened dependency=database',
      );
    },
  );


  this.linkLookupBreaker.on(
    'halfOpen',
    () => {
      this.logger.warn(
        'circuit_half_open dependency=database',
      );
    },
  );


  this.linkLookupBreaker.on(
    'close',
    () => {
      this.logger.log(
        'circuit_closed dependency=database',
      );
    },
  );
}
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
async findByCode(code: string): Promise<LinkEntity> {
  return await this.linkLookupBreaker.fire(code);

}
private async lookupLink(
  code: string,
): Promise<LinkEntity> {

  const link = await this.linkRepository.findOne({
    where: { code },
  });


  if (!link) {
    throw new NotFoundException(
      'Short URL not found',
    );
  }


  return link;
}
private async retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {

    try {
      return await fn();
    } catch (error) {

      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      const baseDelay = 100;

      const exponentialDelay =
        baseDelay * Math.pow(2, attempt);

      const jitter =
        Math.floor(Math.random() * 50);

      const delay =
        exponentialDelay + jitter;


      this.logger.warn({
        event: 'retry_attempt',
        attempt: attempt + 1,
        delay_ms: delay,
      });


      await new Promise(resolve =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
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
): Promise<LinkEntity> {

  const normalizedDomain = createLinkDto.domain
    ? createLinkDto.domain.toLowerCase()
    : undefined;

  if (createLinkDto.custom_code) {
    const exists = await this.linkRepository.findOne({
      where: {
        code: createLinkDto.custom_code,
        domain: normalizedDomain ?? IsNull(),
      },
    });

    if (exists) {
      throw new ConflictException(
        'Short code already exists for this domain',
      );
    }
  }

  const code =
    createLinkDto.custom_code ||
    this.generateShortCode();

  const newLink = this.linkRepository.create({
    code,
    long_url: createLinkDto.long_url,
    principal_id: principalId,
    expires_at: createLinkDto.expires_at
      ? new Date(createLinkDto.expires_at)
      : undefined,
    tags: createLinkDto.tags || [],
    password: createLinkDto.password || undefined,
    domain: normalizedDomain,
    clicks_count: 0,
  });

  const savedLink =
    await this.linkRepository.save(newLink);

  await this.webhooksService.dispatch(
    principalId,
    'link.created',
    savedLink,
  );

  return savedLink;
}
  async search(
  principalId: string,
  search?: string,
  tag?: string,
  page = 1,
  limit = 10,
  sort = 'created_at',
) {


  const query = this.linkRepository
    .createQueryBuilder('link')
    .where('link.principal_id = :principalId', {
      principalId,
    });

  if (search) {
    query.andWhere(
      `to_tsvector('english', link.long_url)
       @@ plainto_tsquery('english', :search)`,
      { search },
    );
  }

  if (tag) {
    query.andWhere(':tag = ANY(link.tags)', {
      tag,
    });
  }

  query.orderBy(
    `link.${sort}`,
    'DESC',
  );

  const [data, total] =
    await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

  return {
    data,
    page,
    page_size: limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}
  async findOne(
  id: number,
  principalId: string,
): Promise<LinkEntity> {

  const link =
    await this.linkRepository.findOne({
      where: {
        id,
        principal_id: principalId,
      },
    });

  if (!link) {
    throw new NotFoundException(
      'Link not found',
    );
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

  return 'desktop';
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
      recent_clicks: logs.slice(0, 10)
    };
  }
  async findPaginated(
  principalId: string,
  page = 1,
  limit = 10,
  search?: string,
  tag?: string,
  sort: 'created_at' | 'clicks_count' = 'created_at',
) {
  limit = Math.min(limit, 50);

  const query = this.linkRepository
    .createQueryBuilder('link')
    .where('link.principal_id = :principalId', {
      principalId,
    });

  if (search) {
    query.andWhere(
      `to_tsvector('english', link.long_url)
       @@ plainto_tsquery('english', :search)`,
      { search },
    );
  }

  if (tag) {
    query.andWhere(':tag = ANY(link.tags)', {
      tag,
    });
  }

  query.orderBy(
    `link.${sort}`,
    'DESC',
  );

  const [data, total] = await query
    .skip(page * limit)
.take(limit)
    .getManyAndCount();

  return {
    data,
    page,
    page_size: limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}
async remove(
  id: number,
  principalId: string,
) {
  const link = await this.linkRepository.findOne({
    where: {
      id,
      principal_id: principalId,
    },
  });

  if (!link) {
    throw new NotFoundException('Link not found');
  }

  await this.linkRepository.remove(link);

  await this.cacheService.invalidateRedirectTarget(
    link.code,
  );

  return link;
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


