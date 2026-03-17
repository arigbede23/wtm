// Push notification utility — sends browser push notifications to a user.

import webpush from "web-push";

// Configure VAPID keys
webpush.setVapidDetails(
  "mailto:noreply@wtm-one.vercel.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// Send a push notification to all of a user's subscriptions.
// Cleans up expired subscriptions (410 Gone).
export async function sendPushToUser(
  supabase: any,
  userId: string,
  payload: PushPayload
) {
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("userId", userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const message = JSON.stringify(payload);

  const expiredIds: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          message
        );
      } catch (err: any) {
        // 410 Gone means the subscription is no longer valid
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredIds.push(sub.id);
        }
      }
    })
  );

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }
}
