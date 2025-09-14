import { createContext, useContext, useState, useEffect } from "react";
import { Certificate, certificateService } from "@/utils/blockchain";

interface CertificateContextType {
  certificates: Certificate[];
  fetchCertificates: () => Promise<void>;
  addCertificate: (_cert: Certificate) => void;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

/**
 * Provider component for managing certificate state across the application
 * Handles certificate storage, retrieval, and synchronization with blockchain
 * @param children React child components that will have access to certificate context
 */
export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  /**
   * Fetches certificates from local storage and updates their status from blockchain
   * Synchronizes local certificate data with blockchain state
   */
  const fetchCertificates = async () => {
    try {
      const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]") as Certificate[];
      const blockchainCertificates: Certificate[] = [];
      for (const cert of storedCertificates) {
        const blockchainCert = await certificateService.getCertificate(cert.id);
        if (blockchainCert) {
          blockchainCertificates.push(blockchainCert);
        }
      }
      setCertificates(blockchainCertificates);
      localStorage.setItem("certificates", JSON.stringify(blockchainCertificates));
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    }
  };

  /**
   * Adds a new certificate to the local state and storage
   * @param cert Certificate object to add
   */
  const addCertificate = (cert: Certificate) => {
    setCertificates((prev) => [...prev, cert]);
    localStorage.setItem("certificates", JSON.stringify([...certificates, cert]));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <CertificateContext.Provider value={{ certificates, fetchCertificates, addCertificate }}>
      {children}
    </CertificateContext.Provider>
  );
};

/**
 * Hook for accessing certificate context
 * @returns Certificate context containing certificates array and management functions
 * @throws Error if used outside of CertificateProvider
 */
export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error("useCertificates must be used within a CertificateProvider");
  }
  return context;
};