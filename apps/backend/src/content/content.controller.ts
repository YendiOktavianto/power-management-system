import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentService } from './content.service';

@Controller('api/v1/content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Get(':key')
  async get(@Param('key') key: string) {
    const data = await this.service.get(key);
    return { data };
  }

  @Put(':key')
  async put(@Param('key') key: string, @Body() body: UpdateContentDto) {
    const payload = body?.data ?? {};
    await this.service.put(key, payload, body?.updatedBy);
    return { ok: true };
  }
}
