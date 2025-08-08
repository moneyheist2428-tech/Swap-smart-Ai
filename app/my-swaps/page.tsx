'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MySwapsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>My Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage the swaps you have created or participated in.</p>
            <Button asChild>
              <Link href="/create-listing">Create New Listing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
