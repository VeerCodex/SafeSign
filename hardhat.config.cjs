require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL || "https://rpc.monad.xyz",
      chainId: 143,
      accounts: process.env.MONAD_PRIVATE_KEY
        ? [process.env.MONAD_PRIVATE_KEY.startsWith("0x") ? process.env.MONAD_PRIVATE_KEY : `0x${process.env.MONAD_PRIVATE_KEY}`]
        : [],
    },
    monadTestnet: {
      url: process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.MONAD_PRIVATE_KEY
        ? [process.env.MONAD_PRIVATE_KEY.startsWith("0x") ? process.env.MONAD_PRIVATE_KEY : `0x${process.env.MONAD_PRIVATE_KEY}`]
        : [],
    },
  },
};
