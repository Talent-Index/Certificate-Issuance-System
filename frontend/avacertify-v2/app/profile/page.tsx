"use client"

import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { User, Mail, Building, Award, Calendar, Download, Share2 } from "lucide-react"

interface Certificate {
  id: number
  name: string
  issuer: string
  date: string
  verified: boolean
}

const certificates: Certificate[] = [
  {
    id: 1,
    name: "Bachelor of Computer Science",
    issuer: "Tech University",
    date: "2023-06-15",
    verified: true,
  },
  {
    id: 2,
    name: "Advanced Web Development",
    issuer: "Code Academy",
    date: "2023-08-01",
    verified: true,
  },
]

export default function ProfilePage() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    })
  }

  const handleShare = () => {
    toast({
      title: "Certificate Shared",
      description: "Share link copied to clipboard!",
    });
  };

  return (
    <Layout>
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Organization
                    </label>
                    <Input placeholder="Company/Institution" />
                  </div>
                  <Button onClick={handleSave}>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates">
              <div className="grid gap-6">
                {certificates.map((cert) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Award className="h-5 w-5 text-primary" />
                              {cert.name}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {cert.issuer}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {cert.date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  )
}

