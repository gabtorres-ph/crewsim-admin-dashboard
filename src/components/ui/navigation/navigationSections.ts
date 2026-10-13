import { siteConfig } from "@/app/siteConfig"
import {
  RiFolderUserLine,
  RiUserLine,
  RiSimCardLine,
  RiStarLine,
  RiRedPacketLine,
  RiHourglassFill,
  RiPlaneLine,
  RiMessage2Line,
  RiBankCardLine,
  RiTranslate2,
  RiMoneyEuroCircleLine,
  RiTimeZoneLine,
  RiFileListLine,
} from "@remixicon/react"

// todo wire account page here
export const navigationSections = [
  {
    label: "CrewSim Pages",
    items: [
      { name: "Accounts", href: siteConfig.baseLinks.accounts, icon: RiFolderUserLine },
      { name: "Users", href: siteConfig.baseLinks.users, icon: RiUserLine },
      { name: "ESims", href: siteConfig.baseLinks.esims, icon: RiSimCardLine },
      { name: "Favorites", href: siteConfig.baseLinks.favorites, icon: RiStarLine },
      { name: "Packages", href: siteConfig.baseLinks.package_templates, icon: RiRedPacketLine },
      { name: "Usage", href: siteConfig.baseLinks.usage, icon: RiHourglassFill },
      { name: "Crew", href: siteConfig.baseLinks.crew, icon: RiPlaneLine },
      { name: "SMS", href: siteConfig.baseLinks.sms, icon: RiMessage2Line },
      { name: "Stripe Notification", href: siteConfig.baseLinks.stripe_notification, icon: RiBankCardLine },
      { name: "Languages", href: siteConfig.baseLinks.languages, icon: RiTranslate2 },
      { name: "Currencies", href: siteConfig.baseLinks.currencies, icon: RiMoneyEuroCircleLine },
      { name: "Timezones", href: siteConfig.baseLinks.timezones, icon: RiTimeZoneLine },
    ],
  },
  {
    label: "Utilities",
    items: [
      { name: "API Logs", href: siteConfig.baseLinks.utilities.apiLogs, icon: RiFileListLine },
    ],
  },
] as const

export function isNavItemActive(pathname: string, itemHref: string) {
  if (itemHref === siteConfig.baseLinks.settings.general) {
    return pathname.startsWith("/settings")
  }
  return pathname === itemHref || pathname.startsWith(itemHref)
}
