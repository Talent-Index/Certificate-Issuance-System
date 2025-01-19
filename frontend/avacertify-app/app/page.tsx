
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { Toaster, toast } from "react-hot-toast";
import { db } from "./firebase";
import { addDoc, collection } from "firebase/firestore";
// import { certificateService } from "../utils/contractinteraction";
// import ContractInteraction from "../components/ContractInteraction";

export default function Home() {
  // State variables for form inputs and waitlist status
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  
  
  const [walletAddress] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();// Prevent default form submission behavior
    // Here you would typically send the data to your backend
    try {
      // Add form data to Firestore
      await addDoc(collection(db, "waitlist"), {
   name: name,
        email: email,
        interest: interest,
        createdAt: new Date(),
    
      });

      setIsWaitlisted(true);
      toast.success("Successfully joined the waitlist!");
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Something went wrong. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600 text-gray-800">

      {/* Main container with gradient background */}
      <Navbar isWaitlisted={isWaitlisted} /> {/* Navbar component with waitlist status prop */}
      <Toaster position="top-right" /> {/* Toaster component for notifications */}
      <main className="container mx-auto px-4 py-16">
        {/* Main content container */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Centered content container */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Join the Future of Credentialing with AvaCertify
          </motion.h1>
          <motion.p
            className="text-xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience secure, tamper-proof, and verifiable digital credentials on Avalanche.
          </motion.p>
          <motion.div
            className="flex justify-center space-x-4 mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              Secure
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
              Transparent
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold">
              Verifiable
            </span>
          </motion.div>
        </div>

        {/* Form Section */}
        <section className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">Join our waitlist today</h2>
          {!isWaitlisted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="interest" className="block mb-1">
                  Interest Level
                </label>
                <select
                  id="interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select an option</option>
                  <option value="Individual User">Individual User</option>
                  <option value="Institution">Institution</option>
                  <option value="Developer">Developer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <motion.button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Me Up
              </motion.button>
            </form>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-center"
            >
              Thank you for signing up! You now have access to all features.
            </motion.p>
          )}
        </section>
      </main>
    </div>
  );
}
