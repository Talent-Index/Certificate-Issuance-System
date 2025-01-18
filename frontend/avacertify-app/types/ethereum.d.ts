// types/ethereum.d.ts
interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

interface Ethereum {
    request: (args: RequestArguments) => Promise<any>;
    on: (eventName: string, handler: (...args: any[]) => void) => void;
    removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
}

declare global {
    interface Window {
        ethereum?: Ethereum;
    }
}

export {};