import { CLOUD_URL } from "@/lib/site";
// Directory generation has been retired. This route never calls a paid provider.
function paidAccess() {
  return Response.json(
    {
      error: "Custom speech requires purchased OpenSpeech Cloud credits.",
      studio: `${CLOUD_URL}/studio`,
      pricing: `${CLOUD_URL}/pricing`,
    },
    { status: 402, headers: { "Cache-Control": "no-store" } },
  );
}
export const POST = paidAccess;
export const GET = paidAccess;
