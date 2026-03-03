import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AgreementsService {
  constructor(private prisma: PrismaService, private pdfService: PdfService) {}

  private async getCompany(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        partners: { include: { revenueShares: { include: { revenueRule: true } } } },
        revenueRules: { include: { shares: { include: { partner: true } } } },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId) throw new ForbiddenException();
    return company;
  }

  async generate(companyId: string, userId: string) {
    const company = await this.getCompany(companyId, userId);

    // Build agreement content
    const content = JSON.stringify({
      companyId,
      companyName: company.name,
      companyType: company.type,
      partners: company.partners.map(p => ({ id: p.id, fullName: p.fullName, share: p.share })),
      revenueRules: company.revenueRules.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        shares: r.shares.map(s => ({ partnerName: s.partner.fullName, share: s.share })),
      })),
      generatedAt: new Date().toISOString(),
    });

    // Get version
    const lastAgreement = await this.prisma.agreement.findFirst({
      where: { companyId },
      orderBy: { version: 'desc' },
    });
    const version = (lastAgreement?.version || 0) + 1;

    const agreement = await this.prisma.agreement.create({
      data: { companyId, content, version, status: 'DRAFT' },
    });

    // Generate HTML preview
    const html = await this.pdfService.generateAgreementHtml({
      company,
      partners: company.partners,
      revenueRules: company.revenueRules,
      agreement,
    });

    return { agreement, html };
  }

  async exportPdf(id: string, userId: string, signature?: string) {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            partners: true,
            revenueRules: { include: { shares: { include: { partner: true } } } },
          },
        },
      },
    });
    if (!agreement) throw new NotFoundException('Agreement not found');
    if (agreement.company.ownerId !== userId) throw new ForbiddenException();

    if (signature) {
      await this.prisma.agreement.update({ where: { id }, data: { signature } });
      agreement.signature = signature;
    }

    const html = await this.pdfService.generateAgreementHtml({
      company: agreement.company,
      partners: agreement.company.partners,
      revenueRules: agreement.company.revenueRules,
      agreement,
    });

    const filename = `agreement-${id}-${uuid()}`;
    const pdfUrl = await this.pdfService.generatePdf(html, filename);

    await this.prisma.agreement.update({ where: { id }, data: { pdfUrl, status: 'SIGNED' } });

    return { pdfUrl, html };
  }

  async findAll(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException();
    if (company.ownerId !== userId) throw new ForbiddenException();

    return this.prisma.agreement.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!agreement) throw new NotFoundException();
    if (agreement.company.ownerId !== userId) throw new ForbiddenException();
    return agreement;
  }
}
