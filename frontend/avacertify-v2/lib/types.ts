// export type Certificate = {
//   id: string;
//   name: string;
//   issuedBy: string;
//   issueDate: string;
// };

// export const placeholderCertificates: Certificate[] = [
//   {
//     id: "1",
//     name: "Blockchain Developer",
//     issuedBy: "AvaxCertify",
//     issueDate: "2025-03-24",
//   },
// ];

export interface Certificate {

  id: string

  certificateId: string

  transactionHash: string

  recipientName: string

  recipientAddress: string

  certificateType: string

  issueDate: string

  expirationDate: string

  additionalDetails: string

  isRevoked: boolean

  institutionName: string

}



export const placeholderCertificates: Certificate[] = [

  {

    id: "1",

    certificateId: "CERT-123ABC",

    transactionHash: "0x123...",

    recipientName: "John Doe",

    recipientAddress: "0x456...",

    certificateType: "academic",

    issueDate: "2023-01-01",

    expirationDate: "",

    additionalDetails: "Bachelor of Science in Computer Science",

    isRevoked: false,

    institutionName: "Example University"

  }

]
