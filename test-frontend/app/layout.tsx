import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MoveMint NFT Test',
  description: 'Test frontend for MoveMint Dance NFT contract',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}