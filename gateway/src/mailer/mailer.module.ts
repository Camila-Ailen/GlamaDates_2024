import { Module } from '@nestjs/common';
import { PdfService } from './pdf/pdf.service';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService, PdfService],
  exports: [MailerService, PdfService],
})
export class MailerModule {}
