import {
  IsUrl,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
  ValidateIf,
} from 'class-validator';
export class CreateShortUrlDto {
  @IsUrl({}, { message: 'Некорректный URL' })
  url: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o: CreateShortUrlDto) => o.alias !== '')
  @MaxLength(20, { message: 'Алиас не может быть длиннее 20 символов' })
  @MinLength(6, { message: 'Алиас не может быть короче 6 символов' })
  alias?: string;

  @IsOptional()
  @ValidateIf((o: CreateShortUrlDto) => o.expiresAt !== '')
  @IsDateString()
  expiresAt?: string;
}
