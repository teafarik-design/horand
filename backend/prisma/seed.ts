import { PrismaClient, CompanyType, RevenueType, AgreementStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@horand.com' },
    update: {},
    create: {
      email: 'demo@horand.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'OWNER',
    },
  });

  // Create company
  const company = await prisma.company.upsert({
    where: { id: 'seed-company-1' },
    update: {},
    create: {
      id: 'seed-company-1',
      name: 'Канаріс',
      type: CompanyType.COMPANY,
      ownerId: user.id,
    },
  });

  // Create partners
  const partner1 = await prisma.partner.create({
    data: {
      fullName: 'Антонюк Михайло',
      share: 50,
      companyId: company.id,
    },
  });

  const partner2 = await prisma.partner.create({
    data: {
      fullName: 'Новенко Лариса',
      share: 50,
      companyId: company.id,
    },
  });

  // Revenue rules
  const rule1 = await prisma.revenueRule.create({
    data: {
      type: RevenueType.PROJECT,
      name: 'Проєкт Квантіс',
      companyId: company.id,
      shares: {
        create: [
          { partnerId: partner1.id, share: 50 },
          { partnerId: partner2.id, share: 50 },
        ],
      },
    },
  });

  const rule2 = await prisma.revenueRule.create({
    data: {
      type: RevenueType.CLIENTS,
      name: 'Перші 30 клієнтів',
      companyId: company.id,
      shares: {
        create: [
          { partnerId: partner1.id, share: 50 },
          { partnerId: partner2.id, share: 50 },
        ],
      },
    },
  });

  await prisma.revenueRule.create({
    data: {
      type: RevenueType.NET_PROFIT,
      name: 'Чистий прибуток компанії',
      companyId: company.id,
      shares: {
        create: [
          { partnerId: partner1.id, share: 50 },
          { partnerId: partner2.id, share: 50 },
        ],
      },
    },
  });

  // Agreement
  await prisma.agreement.create({
    data: {
      companyId: company.id,
      status: AgreementStatus.DRAFT,
      content: JSON.stringify({ generated: true }),
    },
  });

  console.log('✅ Seed complete!');
  console.log('  Login: demo@horand.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
