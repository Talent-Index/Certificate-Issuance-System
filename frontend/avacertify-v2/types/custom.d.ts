// src/lib/types.ts
export type WalletType = "metamask" | "core" | null;
export type ContractError = Error & { code?: number };

export interface ComponentProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface Certificate {
  id: string;
  certificateId?: string;
  transactionHash?: string;
  recipientName: string;
  recipientAddress: string;
  certificateType: string;
  issueDate: string;
  expirationDate?: string;
  institutionName: string;
  status: 'active' | 'revoked';
  additionalDetails?: string;
}

export const placeholderCertificates: Certificate[] = [];