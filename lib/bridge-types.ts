export type BridgeQuoteResponse = {
  fee: string;
  estimatedReceive: string;
  minReceive: string;
};

export type BridgeTransferRequest = {
  sourceTxHash: `0x${string}`;
};

export type BridgeTransferResponse = {
  sourceTxHash: `0x${string}`;
  targetTxHash: `0x${string}`;
  etaSeconds: number;
};

export type BridgeStatusResponse = {
  sourceTxHash: `0x${string}`;
  completed: boolean;
  targetTxHash?: `0x${string}`;
  targetBlockNumber?: string;
};
