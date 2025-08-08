import { redirect } from 'next/navigation'

// Consolidate to /listings to avoid duplicate pages.
// This server redirect is immediate and preserves deep-links.
export default function Page() {
  redirect('/listings')
}
