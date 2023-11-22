import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AppResource } from 'src/app.roles';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Auth({ resource: AppResource.pdf, action: 'read', possession: 'any' })
  @Get('generate-pdf/:eventoId')
  async generatePdf(@Param('eventoId') eventoId: string, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generatePdf(eventoId);
    const fileName = `solicitudEvento_${eventoId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(pdfBuffer);
  }
}
