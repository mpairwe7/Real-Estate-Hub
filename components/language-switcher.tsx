"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { locales, localeNames, type Locale } from "@/lib/i18n-config"
import { useTransition } from "react"

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const changeLanguage = (locale: Locale) => {
    startTransition(() => {
      // Get the current pathname without the locale prefix
      const segments = pathname.split('/').filter(Boolean)
      const isLocaleInPath = locales.includes(segments[0] as Locale)
      
      // Remove current locale from path if it exists
      const pathWithoutLocale = isLocaleInPath 
        ? '/' + segments.slice(1).join('/')
        : pathname
      
      // Create new path with new locale
      const newPath = locale === 'en' 
        ? pathWithoutLocale || '/'
        : `/${locale}${pathWithoutLocale || '/'}`
      
      router.replace(newPath)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={isPending}>
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[currentLocale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => changeLanguage(locale)}
            className={currentLocale === locale ? "bg-accent" : ""}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
