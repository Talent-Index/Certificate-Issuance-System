
# Certificate Issuance System.

Certificate Issuance System is a decentralized application (dApp) that uses smart contracts on a blockchain (like Avalanche) to issue, verify, and revoke certificates securely.

# Features
1. Issue Certificates
Functionality: The contract owner (issuer) creates a certificate for a recipient.
How It Works:
A unique Certificate ID is assigned.
The recipient’s name, course, and issue date are stored.
An event log is generated for tracking.

2. Verify certificate. 
Functionality: Anyone can check if a certificate is valid.
How It Works:
The blockchain stores certificate data.
A function retrieves the details using the certificate ID.

3. Revoke certificate.
Functionality: The issuer can revoke a certificate if needed.
How It Works:
The smart contract updates the certificate status to false.
Revoked certificates can no longer be verified as valid.

# Tech Stack Used

​Language:
Solidity, JavaScript

​Framework:
Avalanche, React, Node.js, Firebase

​Tools: 
Truffle, Hardhat

# Setup Instructions
1. ​Clone the repository: git clone [repository-url]

2. Install dependencies: npm install

3. ​Compile the contracts: npx hardhat compile

4. Configure the Avalanche network


Deploy to Avalanche network: npx hardhat run scripts/deploy.js --network avalanche
​Run the application locally: npm start
Contract Deployed to Fuji testnet with transaction Hash 0x4450c73190a8045653596cdf43d53dee7b3d6bb9a00ee3b2fe815afc84e5a6d4 Block Hash 0xfbcfb5100242149420123442933b3fed462b09413f1f9ee654cf1a3082ac4ad4 Block Number 37555225 Contract Address 0x0983ef28dc99e06d96f3a0cbcc4b3f74cd4404b0


# My Next.js App

This project is a full-stack application consisting of a frontend built with Next.js and a backend server. 

## Frontend

The frontend is located in the `frontend` directory and is built using React with TypeScript. It includes:

- **Components**: Reusable UI components are located in the `components` directory.
- **Pages**: The main entry point for the application is in the `pages` directory, including the homepage and custom app component.
- **Public Assets**: Static files such as images and fonts are stored in the `public` directory.
- **Styles**: Global CSS styles are defined in the `styles` directory.
- **TypeScript Configuration**: The `tsconfig.json` file contains TypeScript compiler options.
- **Package Configuration**: The `package.json` file lists dependencies and scripts for the frontend.

## Backend

The backend is located in the `backend` directory and is responsible for handling server-side logic. It includes:

- **App Entry Point**: The main server setup is in `src/app.ts`.
- **Type Definitions**: Shared types and interfaces are defined in `src/types/index.ts`.
- **Package Configuration**: The `package.json` file lists dependencies and scripts for the backend.
- **TypeScript Configuration**: The `tsconfig.json` file contains TypeScript compiler options.

## Getting Started

To get started with the project, clone the repository and install the dependencies for both the frontend and backend:

1. Navigate to the `frontend` directory and run:
   ```
   npm install
   npm run dev
   ```

2. In a separate terminal, navigate to the `backend` directory and run:
   ```
   npm install
   npm start
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.


# Team Members
1. Ian Macharia
2. Sharon Kitavi
3. Farhiya Omar
4. Salma Adam
5. Linet Mugwanja
6. Stan
7. Truth

