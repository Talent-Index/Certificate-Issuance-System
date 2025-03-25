"use client"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Eye, CheckCircle, Clock, FileX } from "lucide-react"
import Link from "next/link"
import type { ComponentProps } from "@/types/custom";

const FeatureCard = ({ icon: Icon, title, description }: ComponentProps) => (
  <Card className="group hover:shadow-lg transition-all duration-300 dark:hover:shadow-primary/5">
    <CardContent className="p-6">
      <Icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

const BackgroundAnimation = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-primary/10 rounded-full animate-blob"
        style={{
          width: Math.random() * 300 + 50,
          height: Math.random() * 300 + 50,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
)

export default function Home() {
  return (
    <Layout>
      <section className="relative overflow-hidden gradient-bg py-20 sm:py-32">
        <BackgroundAnimation />
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl animate-fade-in">
              Join the Future of Credentialing with AvaCertify
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in animate-delay-200">
              Experience secure, tamper-proof, and verifiable digital credentials on Avalanche.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in animate-delay-400">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-primary"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Secure"
              description="Leveraging blockchain technology for immutable and tamper-proof certificate storage."
            />
            <FeatureCard
              icon={Eye}
              title="Transparent"
              description="Public verification eliminates trust issues with on-chain data instantly accessible."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Verifiable"
              description="Instant verification without reliance on intermediaries, reducing fraud and inefficiencies."
            />
          </div>
        </div>
      </section>

      <section className="py-20 gradient-bg">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">The Problem We Solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in">
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold mb-2">Time-Consuming Verification</h3>
                  <p className="text-muted-foreground">Manual verification processes are slow and inefficient.</p>
                </CardContent>
              </Card>
            </div>
            <div className="animate-fade-in animate-delay-200">
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold mb-2">Lack of Trust</h3>
                  <p className="text-muted-foreground">Centralized systems are vulnerable to fraud and manipulation.</p>
                </CardContent>
              </Card>
            </div>
            <div className="animate-fade-in animate-delay-400">
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <FileX className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold mb-2">Counterfeit Certificates</h3>
                  <p className="text-muted-foreground">
                    Fraudulent certificates undermine the value of genuine credentials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 gradient-bg">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto text-white">
            <h2 className="text-3xl text-primary font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the future of secure, efficient certificate management and verification.
            </p>
            <Button asChild size="lg" className="rounded-full group">
              <Link href="/dashboard">
                Launch Dashboard
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}

