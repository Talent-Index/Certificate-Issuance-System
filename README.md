# Certificate-Issuance-System
Certificate Issuance System is a decentralized application (dApp) that uses smart contracts on a blockchain (like Avalanche) to issue, verify, and revoke certificates securely.

## Features
# ✅ Issue certificates 
Functionality: The contract owner (issuer) creates a certificate for a recipient.
How It Works:
A unique Certificate ID is assigned.
The recipient’s name, course, and issue date are stored.
An event log is generated for tracking.

# ✅ Verify certificate authenticity.
Functionality: Anyone can check if a certificate is valid.
How It Works:
The blockchain stores certificate data.
A function retrieves the details using the certificate ID.

# ✅ Revoke certificates.
Functionality: The issuer can revoke a certificate if needed.
How It Works:
The smart contract updates the certificate status to false.
Revoked certificates can no longer be verified as valid.

✅ Event logging for all transactions


# Tech Stack Used

​Language: 
 Solidity, JavaScript

​Framework: 
 Avalanche, React, 

​Tools:
   Hardhat, 

# Setup Instructions

1. ​Clone the repository:
git clone [repository-url]

2. Install dependencies:
 npm install

3. ​Compile the contracts:
npx hardhat compile

4. Configure the Avalanche network

​Open the hardhat.config.js file and add your Avalanche network details under the networks section.

1. Deploy to Avalanche network:
npx hardhat run scripts/deploy.js --network avalanche
2. ​Run the application locally:
npm start  


# Team Members
1. Linet Mugwanja
2. Farhiya Omar
3. Salma Adam
3. Sharon Kitavi
4. Ian Macharia
5. Stan
6. Truth



---



