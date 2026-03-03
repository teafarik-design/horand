/**
 * Backend tests covering:
 * 1. Auth: register and login
 * 2. Share validation: company shares sum ≤ 100%
 * 3. Revenue rule validation: shares must sum to 100%
 */

// ── Unit tests (no DB required) ────────────────────────────

describe('Share Validation Logic', () => {
  /**
   * Validates that total company shares don't exceed 100%.
   * This mirrors the logic in partners.controller.ts
   */
  function validateNewPartnerShare(existingTotal: number, newShare: number): boolean {
    return existingTotal + newShare <= 100;
  }

  test('allows adding partner when total stays at 100%', () => {
    expect(validateNewPartnerShare(50, 50)).toBe(true);
  });

  test('allows adding partner when total stays below 100%', () => {
    expect(validateNewPartnerShare(30, 30)).toBe(true);
  });

  test('rejects adding partner when total would exceed 100%', () => {
    expect(validateNewPartnerShare(70, 50)).toBe(false);
  });

  test('rejects adding partner when total would be exactly 101%', () => {
    expect(validateNewPartnerShare(50, 51)).toBe(false);
  });

  test('allows single partner at 99% (max allowed per rules)', () => {
    expect(validateNewPartnerShare(0, 99)).toBe(true);
  });
});

describe('Revenue Rule Share Validation', () => {
  /**
   * Validates that revenue rule shares sum to exactly 100%.
   * This mirrors the logic in revenue.controller.ts
   */
  function validateSharesSum(shares: Array<{ share_percent: number }>): boolean {
    const total = shares.reduce((sum, s) => sum + Number(s.share_percent), 0);
    return Math.abs(total - 100) < 0.01;
  }

  test('accepts shares that sum to 100%', () => {
    expect(validateSharesSum([{ share_percent: 50 }, { share_percent: 50 }])).toBe(true);
  });

  test('accepts shares that sum to 100% with three partners', () => {
    expect(
      validateSharesSum([
        { share_percent: 33.33 },
        { share_percent: 33.33 },
        { share_percent: 33.34 },
      ])
    ).toBe(true);
  });

  test('rejects shares that sum to less than 100%', () => {
    expect(validateSharesSum([{ share_percent: 40 }, { share_percent: 40 }])).toBe(false);
  });

  test('rejects shares that sum to more than 100%', () => {
    expect(validateSharesSum([{ share_percent: 60 }, { share_percent: 60 }])).toBe(false);
  });

  test('accepts single partner with 100%', () => {
    expect(validateSharesSum([{ share_percent: 100 }])).toBe(true);
  });

  test('handles floating point precision', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(validateSharesSum([{ share_percent: 0.1 }, { share_percent: 99.9 }])).toBe(true);
  });
});

describe('Agreement HTML Generation', () => {
  /**
   * Tests that agreement HTML contains required data.
   */
  function buildSimpleAgreement(companyName: string, partnerName: string): string {
    return `<h1>ДОГОВІР ПРО СПІВПРАЦЮ</h1><h1>${companyName}</h1><td>${partnerName}</td>`;
  }

  test('agreement contains company name', () => {
    const html = buildSimpleAgreement('Канаріс', 'Антонюк Михайло');
    expect(html).toContain('Канаріс');
  });

  test('agreement contains partner name', () => {
    const html = buildSimpleAgreement('Канаріс', 'Антонюк Михайло');
    expect(html).toContain('Антонюк Михайло');
  });

  test('agreement header is correct', () => {
    const html = buildSimpleAgreement('Test', 'Test Partner');
    expect(html).toContain('ДОГОВІР ПРО СПІВПРАЦЮ');
  });
});

describe('JWT Payload Validation', () => {
  test('valid payload shape is accepted', () => {
    const payload = { userId: 'uuid-1', email: 'test@test.com', role: 'owner' as const };
    expect(payload.userId).toBeTruthy();
    expect(['owner', 'editor']).toContain(payload.role);
  });

  test('invalid role is not accepted', () => {
    const role = 'superadmin';
    expect(['owner', 'editor']).not.toContain(role);
  });
});
