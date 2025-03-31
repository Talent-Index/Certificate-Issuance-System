import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    edu: {
      url: "https://open-campus-codex-sepolia.drpc.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY_1] : [],
      chainId: 656476,
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    // },
    // fuji: {
    //   url: "https://api.avax-test.network/ext/bc/C/rpc",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    //   chainId: 43113,
    // },
  },
  etherscan: {
    apiKey: process.env.SNOWTRACE_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  }
};

export default config;
