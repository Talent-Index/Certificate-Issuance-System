# AvaCertify: Certificate Issuance System

## 📝 Description

AvaCertify is a decentralized application (dApp) that leverages smart contracts on the Avalanche blockchain to issue, verify, and revoke certificates securely and transparently.

## 💥 Features

### 1️⃣ Issue Certificates

- **Functionality:** The contract owner (issuer) can create a certificate for a recipient.
- **How It Works:**
  - A unique Certificate ID is assigned.
  - The recipient’s name, course, and issue date are stored on the blockchain.
  - An event log is generated for tracking.

### 2️⃣ Verify Certificates

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

## 🚀 Setup Instructions

### 1️⃣ Clone the repository:

```sh
 git clone https://github.com/Avalanche-Team1-DAO-Kenya/Certificate-Issuance-System.git
```

### 2️⃣ Install dependencies:

```sh
 npm install
```

### 3️⃣ Compile the contracts:

```sh
 npx hardhat compile
```

### 4️⃣ Configure the Avalanche Network:

#### (i) Deploy to the Avalanche Fuji Testnet:

```sh
 npx hardhat run scripts/deploy.js --network fuji
```

#### (ii) Deploy to the Avalanche Mainnet:

```sh
 npx hardhat run scripts/deploy.js --network avalanche
```

#### (iii) Run the application locally:

```sh
 npm start
```

### 📍 Contract Details (Deployed on Fuji Testnet)

- **Transaction Hash:** `0x64340e5faa2ab5d06d00b1dac2212d167abedf939d670631a0d7ad3ae023d6c6`
- **Block Number:** `33573944`
- **Contract Address:** `0x5b0a76A7261b42083a4a4a8A2C101271C8542fFc`

### 5️⃣ Set up Firebase Configuration

In `app/firebase.ts`, add your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

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

🔗 [Pitch Deck](https://drive.google.com/file/d/1G2SWkM36Go3ImLoS5zosMxQxY2-vcMPV/view?usp=drivesdk)

## ⭐ Next Steps

- **Enhance UI/UX:** Improve the frontend for a better user experience.
- **Smart Contract Audit:** Conduct a security audit for robustness.
- **Multi-Chain Deployment:** Expand to other blockchain networks.{not decided}
- **Automated Issuance:** AI-powered bulk certificate issuance.
- **Mobile App Development:** Build a mobile-friendly version.
- **Institutional Partnerships:** Collaborate with universities and certification bodies.
- **Community Engagement:** Grow developer and user adoption.

---






