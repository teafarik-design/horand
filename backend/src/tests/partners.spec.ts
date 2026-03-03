import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PartnersService } from '../partners/partners.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  company: { findUnique: jest.fn() },
  partner: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
};

describe('PartnersService - share validation', () => {
  let service: PartnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PartnersService>(PartnersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw if adding partner would exceed 100%', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', ownerId: 'u1' });
    mockPrisma.partner.findMany.mockResolvedValue([{ share: 70 }, { share: 20 }]); // 90% already used

    await expect(service.create('c1', 'u1', { fullName: 'Test', share: 20 })).rejects.toThrow(BadRequestException);
  });

  it('should allow adding partner when within 100%', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', ownerId: 'u1' });
    mockPrisma.partner.findMany.mockResolvedValue([{ share: 50 }]);
    mockPrisma.partner.create.mockResolvedValue({ id: 'p2', fullName: 'New Partner', share: 50, companyId: 'c1', revenueShares: [] });

    const result = await service.create('c1', 'u1', { fullName: 'New Partner', share: 50 });
    expect(result.share).toBe(50);
  });
});
