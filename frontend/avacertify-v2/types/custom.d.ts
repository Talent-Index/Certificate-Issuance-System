// src/lib/types.ts
/**
 * Represents the type of wallet connected to the application
 * @type {("metamask" | "core" | null)}
 */
export type WalletType = "metamask" | "core" | null;
/**
 * Extended Error type for smart contract related errors
 * @type {Error & { code?: number }}
 */
export type ContractError = Error & { code?: number };

/**
 * Props interface for reusable UI components
 * @interface ComponentProps
 * @property {React.ComponentType<{ className?: string }>} icon - Icon component to be displayed
 * @property {string} title - Title text for the component
 * @property {string} description - Description text for the component
 */
export interface ComponentProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

/**
 * Represents a digital certificate in the system
 * @interface Certificate
 * @property {string} id - Unique identifier for the certificate
 * @property {string} [certificateId] - Optional smart contract token ID
 * @property {string} [transactionHash] - Optional blockchain transaction hash
 * @property {string} recipientName - Name of the certificate recipient
 * @property {string} recipientAddress - Blockchain address of the recipient
 * @property {string} certificateType - Type or category of the certificate
 * @property {string} issueDate - Date when the certificate was issued
 * @property {string} [expirationDate] - Optional expiration date
 * @property {string} institutionName - Name of the issuing institution
 * @property {'active' | 'revoked'} status - Current status of the certificate
 * @property {string} [additionalDetails] - Optional additional information
 */
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