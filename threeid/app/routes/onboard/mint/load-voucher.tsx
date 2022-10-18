import { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getUserSession(request);

  // TODO: remove chain id and redirect to /auth
  if (!session || !session.has("jwt")) {
    return json(null, {
      status: 500,
    });
  }

  const jwt = session.get("jwt");

  const url = new URL(request.url);
  const queryAddress = url.searchParams.get("address");
  const address = queryAddress ?? session.get("address");

  let cachedVoucher = await getCachedVoucher(address);

  const publicProfileRes = await oortSend("kb_getObject", ["3id.profile", "public_profile"], {
    jwt
  });

  let profile = publicProfileRes.result?.value;

  if (cachedVoucher && !cachedVoucher.minted) {
    // Check mint status
    let pfpData = profile?.pfp;
    if (pfpData) {
      // If minted update voucher cache
      if (pfpData.isToken) {
        cachedVoucher = await putCachedVoucher(address, {
          ...cachedVoucher,
          minted: true,
        });
      }
    }

    return cachedVoucher;
  }

  let voucher = await fetchVoucher({ address, skipImage: !!cachedVoucher });
  voucher = await putCachedVoucher(address, voucher);

  profile.pfp = {
    url: voucher.metadata.image,
    cover: voucher.metadata.cover,
    //@ts-ignore
    contractAddress: MINTPFP_CONTRACT_ADDRESS,
    isToken: false,
  }

  const setDataRes = await oortSend(
    "kb_putObject",
    [
      "3id.profile",
      "public_profile",
      profile,
      {
        visibility: "public"
      }
    ],
    {
      jwt,
    }
  );

  if (setDataRes.error) {
    throw new Error("Unable to persist pfp data");
  }

  return json(voucher);
};
