export type WalletType = "metamask" | "core" | null;
export type ContractError = Error & { code?: number };

export interface ComponentProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}