import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ShortUrlService } from './shorten/short_url.service';
import { ShortUrl } from './shorten/short_url.schema';
import { CreateShortUrlDto } from './shorten/create-short-url.dto';

@Controller()
export class AppController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post('/shorten')
  async createShortUrl(
    @Body(new ValidationPipe()) shortenDto: CreateShortUrlDto,
  ): Promise<ShortUrl> {
    const { url, alias, expiresAt } = shortenDto;

    return await this.shortUrlService.create({
      url,
      alias,
      expiresAt,
    });
  }

  @Get('/:shortUrl')
  async redirectToOriginal(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const url = await this.shortUrlService.redirectToOriginal(shortUrl, req.ip);
    return res.status(HttpStatus.MOVED_PERMANENTLY).redirect(url);
  }

  @Delete('/delete/:shortUrl')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShortUrl(@Param('shortUrl') shortUrl: string) {
    await this.shortUrlService.deleteUrl(shortUrl);
  }

  @Get('/info/:shortUrl')
  async infoShortUrl(@Param('shortUrl') shortUrl: string): Promise<ShortUrl> {
    const result = await this.shortUrlService.get(shortUrl);
    if (!result) {
      throw new NotFoundException('URL not found');
    }

    return result;
  }

  @Get('/analytics/:shortUrl')
  async analyticsShortUrl(@Param('shortUrl') shortUrl: string) {
    return await this.shortUrlService.analytics(shortUrl);
  }
}
