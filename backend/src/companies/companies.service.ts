import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: { name: dto.name, type: dto.type, ownerId: userId },
      include: { partners: true, revenueRules: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { ownerId: userId },
      include: {
        partners: { include: { revenueShares: { include: { revenueRule: true } } } },
        revenueRules: { include: { shares: { include: { partner: true } } } },
        agreements: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { partners: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        partners: { include: { revenueShares: { include: { revenueRule: true } } } },
        revenueRules: { include: { shares: { include: { partner: true } } } },
        agreements: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    if (company.ownerId !== userId) throw new ForbiddenException();
    return company;
  }

  async update(id: string, userId: string, dto: UpdateCompanyDto) {
    await this.findOne(id, userId);
    return this.prisma.company.update({
      where: { id },
      data: { name: dto.name, type: dto.type },
      include: { partners: true, revenueRules: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.company.delete({ where: { id } });
    return { success: true };
  }
}
