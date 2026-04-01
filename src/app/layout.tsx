import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Selectia - Reclutamiento con IA',
  description: 'Plataforma de reclutamiento inteligente con IA y WhatsApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
