import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LinksService } from '../links/links.service';

@Processor('click-events')
export class ClickProcessor extends WorkerHost {

  constructor(
    private readonly linksService: LinksService,
  ) {
    super();
  }


  async process(job: Job) {

    console.log(
      'Processing click job:',
      job.id,
    );

    const {
      linkId,
      userAgent,
      referrer,
    } = job.data;


    await this.linksService.recordClick(
      linkId,
      userAgent,
      referrer,
    );
  }
}