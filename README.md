# AvaCertify - Certificate Issuance System

A decentralized certificate issuance and verification system built on Avalanche blockchain using Foundry framework. This system provides secure, tamper-proof, and verifiable digital credentials through smart contracts and a modern web interface.

## 🎥 Project Demo and Pitch

https://github.com/I-Macharia/Certificate-Issuance-System/AvaCertify_Pitch.mp4

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
=======
- **Functionality:** Anyone can verify a certificate’s validity.
- **How It Works:**
  - The blockchain securely stores certificate data.
  - A function retrieves certificate details using the Certificate ID.

### 3️⃣ Revoke Certificates

- **Functionality:** The issuer can revoke a certificate if necessary.
- **How It Works:**
  - The smart contract updates the certificate status to "revoked."
  - Revoked certificates can no longer be verified as valid.

## 🛠️ Tech Stack

- **Languages:** Solidity, JavaScript
- **Frameworks:** Avalanche, React, Node.js, Firebase
- **Tools:** Truffle, Hardhat


## 🔧 Project Structure

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

## 🚀 Setup Instructions for the Backend


### Set up Firebase Configuration

In `app/firebase.ts`, add your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
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

We love your input! We want to make contributing to AvaCertify as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Development Process

1. **Fork the Repository**
2. **Clone your Fork**
   ```bash
   git clone https://github.com/your-username/Certificate-Issuance-System.git
   cd Certificate-Issuance-System
   ```

3. **Create a Branch**
   ```bash
   # Name your branch based on the type of contribution
   git checkout -b feat/amazing-feature     # for features
   git checkout -b fix/bug-description      # for bug fixes
   git checkout -b docs/documentation-name  # for documentation
   git checkout -b test/test-description   # for tests
   ```

4. **Make your Changes**
   - Write meaningful, clean, and testable code
   - Follow the coding standards and guidelines
   - Keep your changes focused and atomic

5. **Commit your Changes**
   ```bash
   # Use conventional commit messages
   git commit -m "feat: add amazing feature"
   git commit -m "fix: resolve issue with certificate validation"
   git commit -m "docs: update deployment instructions"
   git commit -m "test: add tests for certificate issuance"
   ```

   Commit Message Format:
   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```
   
   Types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, missing semicolons, etc)
   - `refactor`: Code refactoring
   - `test`: Adding missing tests
   - `chore`: Maintenance tasks

6. **Run Tests**
   ```bash
   # Smart Contracts
   forge test
   forge coverage

   # Frontend
   cd frontend/avacertify-v2
   npm run test
   ```

7. **Push to your Fork**
   ```bash
   git push origin your-branch-name
   ```

8. **Open a Pull Request**
   - Provide a clear title and description
   - Link any relevant issues
   - Include screenshots/videos for UI changes
   - Update documentation if needed

### Development Guidelines

#### Smart Contracts
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Add NatSpec comments for all public functions
- Maintain test coverage above 90%
- Use OpenZeppelin contracts when possible
- Add events for important state changes
- Document all state variables

#### Frontend
- Use TypeScript for all new code
- Follow React hooks best practices
- Maintain consistent component structure
- Use shadcn/ui component patterns
- Add proper error handling
- Keep components small and focused

#### Testing
- Write unit tests for all new features
- Include integration tests for complex flows
- Test edge cases and error conditions
- Document test scenarios
- Update test documentation

#### Documentation
- Update README for new features
- Add JSDoc comments for TypeScript code
- Document environment variables
- Include setup steps for new features
- Add inline comments for complex logic

#### Pull Request Checklist
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No unnecessary dependencies added
- [ ] No sensitive information included
- [ ] Commit messages follow convention

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
## 🔧 Project Structure

### Frontend (Next.js)

- **Components:** Reusable UI components (`/components` directory).
- **Pages:** Main entry points for the application (`/pages` directory).
- **Public Assets:** Static files such as images (`/public` directory).
- **Styles:** Global styles (`/styles` directory).
- **TypeScript Config:** Compiler options in `tsconfig.json`.
- **Package Config:** Dependencies and scripts in `package.json`.

### Backend

- **App Entry Point:** Server logic in `src/app.ts`.
- **Type Definitions:** Shared types/interfaces in `src/types/index.ts`.
- **Database:** Firebase integration for user profiles and waitlist.

## 🏗️ Getting Started

### Frontend Setup:

```sh
 cd frontend
 npm install
 npm run dev
```

### Backend Setup:

```sh
 cd backend
 npm install
 npm start
```



## 📜 License

This project is licensed under the **MIT License**.

## 👥 Team Members

- **Ian Macharia** - Smart Contract Developer  macharia.gichoya@gmail.com
- **Sharon Kitavi** - Backend Developer  -sharonkmwikali@gmail.com
- **Farhiya Omar** - Backend Developer  -farhiyaomar24@gmail.com
- **Salma Adam** - Smart Contract Developer  -salmaadambakari@gmail.com
- **Linet Mugwanja** - Frontend Developer  -mugwanjalk@gmail.com
- **Stan** - Backend Developer             -e.n.ndegwa00@gmail.com
- **Truth** - Frontend Developer  trutherkadi@gmail.com

## 📢 Additional Resources

🔗 [Pitch Deck]([https://drive.google.com/file/d/1G2SWkM36Go3ImLoS5zosMxQxY2-vcMPV/view?usp=drivesdk](https://gamma.app/docs/AvaCertify-Revolutionizing-Credential-Management--ctdoowmvbvdevl2?mode=doc))

## ⭐ Next Steps

- **Enhance UI/UX:** Improve the frontend for a better user experience.
- **Smart Contract Audit:** Conduct a security audit for robustness.
- **Multi-Chain Deployment:** Expand to other blockchain networks.{not decided}
- **Automated Issuance:** AI-powered bulk certificate issuance.
- **Mobile App Development:** Build a mobile-friendly version.
- **Institutional Partnerships:** Collaborate with universities and certification bodies.
- **Community Engagement:** Grow developer and user adoption.

---






