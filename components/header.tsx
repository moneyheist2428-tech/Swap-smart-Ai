'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Browse' }, // canonical path for browsing
  { href: '/nearby', label: 'Nearby' },
  { href: '/search', label: 'Search' },
  { href: '/create-listing', label: 'Create' },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-2">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              active
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/abstract-logo.png"
              width={28}
              height={28}
              alt="Swap Smart AI logo"
              className="rounded"
              priority
            />
            <span className="font-semibold">Swap Smart AI</span>
          </Link>
          <div className="hidden md:block">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Keep the primary CTA once; avoid duplicating Browse/Nearby */}
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/create-listing">Post a Listing</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="p-4 border-b flex items-center gap-2">
                <Image
                  src="/abstract-logo.png"
                  width={24}
                  height={24}
                  alt="Swap Smart AI logo"
                  className="rounded"
                />
                <span className="font-semibold">Menu</span>
              </div>
              <div className="p-4 space-y-3">
                <NavLinks />
                <Button asChild className="w-full">
                  <Link href="/create-listing">Post a Listing</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
