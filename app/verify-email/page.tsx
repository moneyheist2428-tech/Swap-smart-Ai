'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-16 px-4 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>We sent you a verification link. Please check your inbox.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Didn’t receive it? Check your spam folder or try signing up again.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
