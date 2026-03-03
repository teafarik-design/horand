import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = { sign: jest.fn().mockReturnValue('mock-token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validateUser', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashed, name: 'Test', role: 'OWNER' });
      await expect(service.validateUser('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user without password on success', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashed, name: 'Test', role: 'OWNER' });
      const result = await service.validateUser('test@test.com', 'correct');
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@test.com');
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'exists@test.com' });
      await expect(service.register({ email: 'exists@test.com', password: 'pass123', name: 'Test' })).rejects.toThrow(ConflictException);
    });

    it('should return access_token on successful registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: '2', email: 'new@test.com', name: 'New', role: 'OWNER', createdAt: new Date(), updatedAt: new Date(), password: 'hashed' });
      const result = await service.register({ email: 'new@test.com', password: 'pass123', name: 'New' });
      expect(result).toHaveProperty('access_token');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
