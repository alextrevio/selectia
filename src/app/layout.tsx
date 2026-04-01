import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'select.ia — Reclutamiento con IA por WhatsApp',
  description:
    'Tu agente de inteligencia artificial entrevista y filtra candidatos 24/7 por WhatsApp. Pipeline visual, score automático y reportes en tiempo real.',
  keywords: ['reclutamiento', 'IA', 'WhatsApp', 'ATS', 'hiring', 'reclutador', 'candidatos'],
  openGraph: {
    title: 'select.ia — Reclutamiento con IA por WhatsApp',
    description:
      'Tu agente de IA entrevista y filtra candidatos 24/7. Tú solo revisas a los que ya están calificados.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'select.ia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'select.ia — Reclutamiento con IA por WhatsApp',
    description:
      'Tu agente de IA entrevista y filtra candidatos 24/7. Tú solo revisas a los que ya están calificados.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
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
