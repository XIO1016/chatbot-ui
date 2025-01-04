import { Toaster } from "@/components/ui/sonner"
import { GlobalState } from "@/components/utility/global-state"
import { Providers } from "@/components/utility/providers"
import TranslationsProvider from "@/components/utility/translations-provider"
import initTranslations from "@/lib/i18n"
import { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ReactNode } from "react"
import "./globals.css"

import AuthProvider from "@/components/AuthProvider" // 클라이언트 컴포넌트 import

const inter = Inter({ subsets: ["latin"] })
const APP_NAME = "GTN SERVICE"
const APP_DEFAULT_TITLE = "GTN SERVICE"
const APP_TITLE_TEMPLATE = "%s - GTN SERVICE"
const APP_DESCRIPTION = "GTN SERVICE PWA!"

interface RootLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: APP_DEFAULT_TITLE
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: "#000000"
}

const i18nNamespaces = ["translation"]

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {/* AuthProvider로 감쌉니다 */}
          <Providers attribute="class" defaultTheme="dark">
            <TranslationsProvider
              namespaces={i18nNamespaces}
              locale={locale}
              resources={resources}
            >
              <Toaster richColors position="top-center" duration={3000} />
              <div className="bg-background text-foreground flex h-dvh flex-col items-center overflow-x-auto">
                <GlobalState>{children}</GlobalState>
              </div>
            </TranslationsProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
