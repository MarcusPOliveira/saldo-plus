/* eslint-disable camelcase */
/* eslint-disable import/order */
import type { Metadata } from 'next'
import Head from 'next/head'
import { ClerkProvider } from '@clerk/nextjs'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from '@vercel/analytics/react'

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
        <Head>
          <meta
            name="apple-mobile-web-app-title"
            title="Saldo+"
            content="Saldo+"
          />
        </Head>
        <body className={`${GeistSans.className} antialiased`}>
          <Toaster richColors position="bottom-right" />
          <RootProviders>
            {children}
            <Analytics />
          </RootProviders>
        </body>
      </html>
    </ClerkProvider>
  )
}
