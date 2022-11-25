import { redirect } from "@remix-run/cloudflare";

export const loader = async ({}) => {
  console.log('redirecting to /dashboard')
  return redirect("/account/dashboard");
};
