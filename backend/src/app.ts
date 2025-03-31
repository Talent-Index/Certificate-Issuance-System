import express from 'express';
//import cors from "cors";
//import dotenv from "dotenv";
//import certificateRoutes from "./routes/certificateRoutes";

//dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
//app.use("/api/certificates", certificateRoutes);

// Example route
app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});