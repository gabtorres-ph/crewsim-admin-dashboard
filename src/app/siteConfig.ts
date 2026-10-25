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
    stripe_notification: "/stripe_notification",
    sim_notification: "/sim_notification",
    languages: "/languages",
    currencies: "/currencies",
    roamingPlans: "/roaming-plans",
    timezones: "/timezones",
    utilities: {
      apiLogs: "/utilities/api-logs"
    },
  },
}

export type siteConfig = typeof siteConfig
