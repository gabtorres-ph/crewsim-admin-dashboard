export const siteConfig = {
  name: "Dashboard",
  url: "https://dashboard.tremor.so",
  description: "The only dashboard you will ever need.",
  baseLinks: {
    home: "/",
    accounts: "/accounts",
    users: "/users",
    esims: "/esims",
    favorites: "/favorites",
    package_templates: "/packages",
    usage: "/usage",
    crew: "/crew",
    sms: "/sms",
    email: "/email",
    stripe_notification: "/stripe_notification",
    languages: "/languages",
    currencies: "/currencies",
    timezones: "/timezones",
    overview: "/overview",
    details: "/details",
    settings: {
      general: "/settings/general",
      billing: "/settings/billing",
      users: "/settings/users",
    },
  },
}

export type siteConfig = typeof siteConfig
