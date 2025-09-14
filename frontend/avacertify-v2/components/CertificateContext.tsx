import { createContext, useContext, useState, useEffect } from "react";
import { Certificate, certificateService } from "@/utils/blockchain";

interface CertificateContextType {
  certificates: Certificate[];
  fetchCertificates: () => Promise<void>;
  addCertificate: (cert: Certificate) => void;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

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

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error("useCertificates must be used within a CertificateProvider");
  }
  return context;
};