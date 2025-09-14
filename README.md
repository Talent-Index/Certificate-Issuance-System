# AvaCertify - Certificate Issuance System

A decentralized certificate issuance and verification system built on Avalanche blockchain using Foundry framework. This system provides secure, tamper-proof, and verifiable digital credentials through smart contracts and a modern web interface.

## 🎥 Project Demo and Pitch

https://github.com/I-Macharia/Certificate-Issuance-System/assets/raw/main/AvaCertify_Pitch.mp4

## 🚀 Deployed Contracts (Avalanche Fuji Testnet)

### Smart Contracts
- **CertificateIssuanceSystem**: [`0xb90c5B3fE62f463AF697B6bC53ac579b0B2f0F2A`](https://testnet.snowtrace.io/address/0xb90c5B3fE62f463AF697B6bC53ac579b0B2f0F2A)
  - Main certificate management contract with role-based access control
  - Supports certificate issuance, revocation, and transfers
  - Features admin and issuer role management

- **OrganizationNFTCertificate**: [`0xdE5b750ebBc0A92a53614f18081E72609F09BC69`](https://testnet.snowtrace.io/address/0xdE5b750ebBc0A92a53614f18081E72609F09BC69)
  - NFT-based certificate with organization branding support
  - ERC721 compliance with custom metadata
  - Organization registration and branding features

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Blockchain Integration**: Ethers.js v6
- **UI Components**: Shadcn/ui components
- **Location**: `frontend/avacertify-v2/`

### Smart Contracts (Foundry)
- **Framework**: Foundry (Forge, Cast, Anvil)
- **Language**: Solidity 0.8.26
- **Dependencies**: OpenZeppelin Contracts v5
- **Location**: `src/`

### Key Features
- 🔐 **Role-based Access Control**: Admin and Issuer roles with granular permissions
- 📜 **Certificate Management**: Issue, revoke, transfer, and verify certificates
- 🎨 **NFT Integration**: Optional NFT minting with organization branding
- 🌐 **IPFS Storage**: Decentralized metadata and document storage
- ✅ **Real-time Verification**: Instant on-chain certificate verification
- 🔒 **Security**: Reentrancy protection and comprehensive access controls

## 🛠️ Development Setup

### Prerequisites
- **Node.js** v18+ and npm/yarn
- **Foundry** toolkit for smart contract development
- **Git** for version control
- **Metamask** or compatible wallet for blockchain interaction

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Certificate-Issuance-System
   ```

2. **Install Foundry dependencies:**
   ```bash
   forge install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend/avacertify-v2
   npm install
   ```

4. **Environment Configuration:**
   ```bash
   # Root directory - Copy and configure
   cp .env.example .env
   
   # Add your private key and RPC URLs
   PRIVATE_KEY=your_private_key_here
   AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
   ```

## 🧪 Testing & Development

### Smart Contract Testing
```bash
# Run all tests
forge test

# Run tests with verbose output
forge test -vvv

# Run specific test file
forge test --match-path test/CertificateIssuanceSystem.t.sol

# Generate gas report
forge test --gas-report
```

### Frontend Development
```bash
cd frontend/avacertify-v2
npm run dev
```

### Local Blockchain Development
```bash
# Start local Anvil chain
anvil

# Deploy to local chain
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key <your-key> --broadcast
```

## 📋 Usage Guide

### For Certificate Issuers
1. **Access Admin Panel**: Navigate to `/admin` (requires admin wallet)
2. **Issue Certificate**: Fill recipient details and certificate metadata
3. **Manage Roles**: Grant issuer permissions to authorized users
4. **Verify Certificates**: Use built-in verification tools

### For Certificate Recipients
1. **View Certificates**: Access personal dashboard to view owned certificates
2. **Share Verification**: Generate shareable verification links
3. **Transfer Certificates**: Move certificates to different wallet addresses
4. **Download Metadata**: Access IPFS-stored certificate documents

### Smart Contract Interaction
```solidity
// Issue a new certificate
function issueCertificate(
    string calldata recipientName,
    address recipientAddress
) external onlyRole(ISSUER_ROLE);

// Verify certificate validity
function verifyCertificate(uint256 tokenId) external view returns (bool);

// Revoke certificate (admin only)
function revokeCertificate(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE);
```

## 🔧 Configuration

### Contract Configuration
Key settings in `src/CertificateIssuanceSystem.sol`:
- Role management for admin and issuer permissions
- Certificate metadata structure
- Transfer and revocation policies

### Frontend Configuration
Located in `frontend/avacertify-v2/utils/contractConfig.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  CERTIFICATE_SYSTEM: "0x9213c9e46e950dcb316ba35126f39299bb0ecaaa",
  NFT_CERTIFICATE: "0xdE5b750ebBc0A92a53614f18081E72609F09BC69"
};
```

## 🚀 Deployment

### Avalanche Fuji Testnet Deployment
The contracts are deployed and verified on Avalanche Fuji testnet:

```bash
# Deploy script used
forge script script/Deploy.s.sol --rpc-url $AVALANCHE_FUJI_RPC --private-key $PRIVATE_KEY --broadcast --verify

# Verification command
forge verify-contract --chain-id 43113 --watch <CONTRACT_ADDRESS> <CONTRACT_NAME>
```

### Custom Deployment
```bash
# Deploy to different network
forge script script/Deploy.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast

# Update frontend configuration
# Edit frontend/avacertify-v2/utils/contractConfig.ts with new addresses
```

## 📊 Project Structure

```
Certificate-Issuance-System/
├── src/                          # Smart contracts
│   ├── CertificateIssuanceSystem.sol
│   └── OrganizationNFTCertificate.sol
├── script/                       # Deployment scripts
│   └── Deploy.s.sol
├── test/                         # Contract tests
│   ├── CertificateIssuanceSystem.t.sol
│   └── OrganizationNFTCertificate.t.sol
├── frontend/avacertify-v2/       # Next.js application
│   ├── app/                      # Next.js 14 app router
│   ├── components/               # React components
│   ├── utils/                    # Utilities and config
│   └── services/                 # Blockchain services
├── foundry.toml                  # Foundry configuration
└── README.md                     # This file
```

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Run Tests**: Ensure all tests pass
4. **Commit Changes**: `git commit -m 'Add amazing feature'`
5. **Push Branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Development Guidelines
- Follow Solidity style guide
- Write comprehensive tests for smart contracts
- Use TypeScript for frontend development
- Follow conventional commit messages
- Update documentation for new features

## 🔐 Security

- All contracts use OpenZeppelin security patterns
- Role-based access control implemented
- Reentrancy guards on critical functions
- Comprehensive test coverage
- Regular security audits recommended

### Reporting Security Issues
Please report security vulnerabilities to the development team through secure channels.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Avalanche Network** for robust blockchain infrastructure
- **OpenZeppelin** for security-audited contract libraries
- **Foundry** for modern Solidity development tools
- **Next.js** for React framework excellence
- **Tailwind CSS** for utility-first styling

## 📞 Support & Community

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive guides in `/docs`
- **Community**: Join our Discord/Telegram for discussions

---

**Built with ❤️ for secure, decentralized credential management**
