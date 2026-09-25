import { StripeNotificationsTable } from "./StripeNotificationsTable";
import { fetchStripeNotifications } from "./api";

export const dynamic = "force-dynamic";

export default async function StripeNotificationsPage() {
  const notifications = await fetchStripeNotifications({
    offset: 0,
    limit: 100,
  });

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Stripe Notifications
      </h1>
      <div className="mt-4 sm:mt-6 lg:mt-10">
        <StripeNotificationsTable notifications={notifications} />
      </div>
    </>
  );
}
