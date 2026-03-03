import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RevenueRulesService } from '../revenue-rules/revenue-rules.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  company: { findUnique: jest.fn() },
  partner: { findMany: jest.fn() },
  revenueRule: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  revenueShare: { deleteMany: jest.fn() },
};

describe('RevenueRulesService - share validation', () => {
  let service: RevenueRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueRulesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RevenueRulesService>(RevenueRulesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw BadRequestException if shares do not sum to 100%', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', ownerId: 'u1' });
    mockPrisma.partner.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

    await expect(service.create('c1', 'u1', {
      type: 'PROJECT' as any,
      name: 'Test',
      shares: [{ partnerId: 'p1', share: 40 }, { partnerId: 'p2', share: 40 }],
    })).rejects.toThrow(BadRequestException);
  });

  it('should pass validation when shares sum to exactly 100%', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c1', ownerId: 'u1' });
    mockPrisma.partner.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
    mockPrisma.revenueRule.create.mockResolvedValue({ id: 'r1', shares: [] });

    const result = await service.create('c1', 'u1', {
      type: 'PROJECT' as any,
      name: 'Test',
      shares: [{ partnerId: 'p1', share: 50 }, { partnerId: 'p2', share: 50 }],
    });
    expect(result).toBeDefined();
  });
});
