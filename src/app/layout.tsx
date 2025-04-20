/* eslint-disable camelcase */
/* eslint-disable import/order */
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'
// import { GeistMono } from 'geist/font/mono'

import { RootProviders } from '@/components/providers/RootProviders'

import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Saldo+',
  description: 'Saldo+ é uma aplicação de controle financeiro.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="pt-BR"
        className="dark"
        style={{
          colorScheme: 'dark',
        }}
      >
        <body className={`${GeistSans.className} antialiased`}>
          <Toaster richColors position="bottom-right" />
          <RootProviders>{children}</RootProviders>
        </body>
      </html>
    </ClerkProvider>
  )
}
