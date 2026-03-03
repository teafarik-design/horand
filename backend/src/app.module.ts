import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { PartnersModule } from './partners/partners.module';
import { RevenueRulesModule } from './revenue-rules/revenue-rules.module';
import { AgreementsModule } from './agreements/agreements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    PartnersModule,
    RevenueRulesModule,
    AgreementsModule,
  ],
})
export class AppModule {}
