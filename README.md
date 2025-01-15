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