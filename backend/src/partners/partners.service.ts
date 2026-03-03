import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  private async checkCompanyOwner(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId) throw new ForbiddenException();
    return company;
  }

  async validateShares(companyId: string, excludePartnerId?: string) {
    const partners = await this.prisma.partner.findMany({
      where: { companyId, id: excludePartnerId ? { not: excludePartnerId } : undefined },
    });
    const totalShare = partners.reduce((sum, p) => sum + p.share, 0);
    if (totalShare >= 100) throw new BadRequestException('Total partner shares cannot exceed 100%');
    return totalShare;
  }

  async create(companyId: string, userId: string, dto: CreatePartnerDto, photoUrl?: string) {
    await this.checkCompanyOwner(companyId, userId);
    const existingTotal = await this.validateShares(companyId);
    if (existingTotal + dto.share > 100) {
      throw new BadRequestException(`Adding ${dto.share}% would exceed 100%. Available: ${100 - existingTotal}%`);
    }
    return this.prisma.partner.create({
      data: { fullName: dto.fullName, share: dto.share, photoUrl: photoUrl || null, companyId },
      include: { revenueShares: { include: { revenueRule: true } } },
    });
  }

  async findAll(companyId: string, userId: string) {
    await this.checkCompanyOwner(companyId, userId);
    return this.prisma.partner.findMany({
      where: { companyId },
      include: { revenueShares: { include: { revenueRule: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, companyId: string, userId: string, dto: UpdatePartnerDto, photoUrl?: string) {
    await this.checkCompanyOwner(companyId, userId);
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner || partner.companyId !== companyId) throw new NotFoundException('Partner not found');

    if (dto.share !== undefined) {
      const existingTotal = await this.validateShares(companyId, id);
      if (existingTotal + dto.share > 100) {
        throw new BadRequestException(`Share would exceed 100%. Available: ${100 - existingTotal}%`);
      }
    }

    return this.prisma.partner.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.share !== undefined && { share: dto.share }),
        ...(photoUrl && { photoUrl }),
      },
      include: { revenueShares: { include: { revenueRule: true } } },
    });
  }

  async remove(id: string, companyId: string, userId: string) {
    await this.checkCompanyOwner(companyId, userId);
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner || partner.companyId !== companyId) throw new NotFoundException('Partner not found');
    await this.prisma.partner.delete({ where: { id } });
    return { success: true };
  }
}
