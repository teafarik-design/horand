export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'EDITOR';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  type: 'COMPANY' | 'PROJECT';
  ownerId: string;
  createdAt: string;
  partners: Partner[];
  revenueRules: RevenueRule[];
  agreements: Agreement[];
  _count?: { partners: number };
}

export interface Partner {
  id: string;
  fullName: string;
  share: number;
  photoUrl?: string;
  companyId: string;
  createdAt: string;
  revenueShares: RevenueShare[];
}

export interface RevenueRule {
  id: string;
  type: 'PROJECT' | 'CLIENTS' | 'NET_PROFIT';
  name: string;
  description?: string;
  companyId: string;
  shares: RevenueShare[];
}

export interface RevenueShare {
  id: string;
  share: number;
  partnerId: string;
  partner?: Partner;
  revenueRuleId: string;
  revenueRule?: RevenueRule;
}

export interface Agreement {
  id: string;
  version: number;
  status: 'DRAFT' | 'SIGNED' | 'ARCHIVED';
  content: string;
  pdfUrl?: string;
  signature?: string;
  companyId: string;
  createdAt: string;
}
