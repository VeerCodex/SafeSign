export const SAFESIGN_REGISTRY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "reporter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "codeHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "score",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "verdict",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ReportSaved",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAllReports",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "reporter",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "codeHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint8",
            "name": "score",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "verdict",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct SafeSignRegistry.Report[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "codeHash",
        "type": "bytes32"
      }
    ],
    "name": "getReports",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "reporter",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "codeHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint8",
            "name": "score",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "verdict",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct SafeSignRegistry.Report[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "codeHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "score",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "verdict",
        "type": "string"
      }
    ],
    "name": "saveReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalReports",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
