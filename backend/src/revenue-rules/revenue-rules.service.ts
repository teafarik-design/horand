import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRevenueRuleDto } from './dto/create-revenue-rule.dto';
import { UpdateRevenueRuleDto } from './dto/update-revenue-rule.dto';

@Injectable()
export class RevenueRulesService {
  constructor(private prisma: PrismaService) {}

  private async checkCompanyOwner(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId) throw new ForbiddenException();
    return company;
  }

  private validateSharesSum(shares: { partnerId: string; share: number }[]) {
    const total = shares.reduce((sum, s) => sum + s.share, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new BadRequestException(`Revenue shares must sum to 100%. Currently: ${total}%`);
    }
  }

  async create(companyId: string, userId: string, dto: CreateRevenueRuleDto) {
    await this.checkCompanyOwner(companyId, userId);
    this.validateSharesSum(dto.shares);

    // Verify all partner IDs belong to this company
    const partnerIds = dto.shares.map(s => s.partnerId);
    const partners = await this.prisma.partner.findMany({
      where: { id: { in: partnerIds }, companyId },
    });
    if (partners.length !== partnerIds.length) {
      throw new BadRequestException('Some partners do not belong to this company');
    }

    return this.prisma.revenueRule.create({
      data: {
        type: dto.type,
        name: dto.name,
        description: dto.description,
        companyId,
        shares: {
          create: dto.shares.map(s => ({ partnerId: s.partnerId, share: s.share })),
        },
      },
      include: { shares: { include: { partner: true } } },
    });
  }

  async findAll(companyId: string, userId: string) {
    await this.checkCompanyOwner(companyId, userId);
    return this.prisma.revenueRule.findMany({
      where: { companyId },
      include: { shares: { include: { partner: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, companyId: string, userId: string, dto: UpdateRevenueRuleDto) {
    await this.checkCompanyOwner(companyId, userId);
    const rule = await this.prisma.revenueRule.findUnique({ 
      where: { id },
      include: { shares: true },
    });
    if (!rule || rule.companyId !== companyId) throw new NotFoundException('Rule not found');

    if (dto.shares) {
      this.validateSharesSum(dto.shares);
      // Verify all partner IDs belong to this company
      const partnerIds = dto.shares.map(s => s.partnerId);
      const partners = await this.prisma.partner.findMany({
        where: { id: { in: partnerIds }, companyId },
      });
      if (partners.length !== partnerIds.length) {
        throw new BadRequestException('Some partners do not belong to this company');
      }
    }

    // Use transaction to atomically replace shares
    return this.prisma.$transaction(async (tx) => {
      if (dto.shares) {
        await tx.revenueShare.deleteMany({ where: { revenueRuleId: id } });
      }

      return tx.revenueRule.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.type && { type: dto.type }),
          ...(dto.shares && {
            shares: {
              create: dto.shares.map(s => ({ partnerId: s.partnerId, share: s.share })),
            },
          }),
        },
        include: { shares: { include: { partner: true } } },
      });
    });
  }

  async remove(id: string, companyId: string, userId: string) {
    await this.checkCompanyOwner(companyId, userId);
    const rule = await this.prisma.revenueRule.findUnique({ where: { id } });
    if (!rule || rule.companyId !== companyId) throw new NotFoundException('Rule not found');
    await this.prisma.revenueRule.delete({ where: { id } });
    return { success: true };
  }
}
