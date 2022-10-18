import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useTransition,
  PrefetchPageLinks,
} from "@remix-run/react";
import { Label, TextInput, Spinner } from "flowbite-react";

import { useEffect, useState } from "react";
import { Button, ButtonSize, ButtonType } from "~/components/buttons";


import Heading from "~/components/typography/Heading";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const data = await oortSend("kb_getObject", ["3id.profile", "public_profile"], {
    jwt
  });

  return json({
    displayname: data.result?.value?.displayname,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const form = await request.formData();
  const displayname = form.get("displayname");

  const errors: {
    profile?: string;
    displayname?: string;
  } = {};

  if (typeof displayname !== "string" || displayname === "") {
    errors.displayname = "Display Name needs to be provided";
  }

  // Get existing object | error
  const profileData = await oortSend("kb_getObject", ["3id.profile", "public_profile"], {
    jwt
  });

  if (profileData.error) {
    errors.profile = "Failed persisting displayname";
  }

  let profile = null;

  // Create new profile object
  if (!profileData.result?.value) {
    profile = {}
  } else { // Populate profile object with stored properties
    profile = profileData.result.value;
  }

  // Update properties
  profile.displayname = displayname;

  // PUT new object
  const updatedProfileData = await oortSend(
    "kb_putObject",
    ["3id.profile", "public_profile", profile, {
      visibility: "public"
    }],
    {
      jwt,
    }
  );

  if (updatedProfileData.error) {
    errors.displayname = "Failed persisting displayname";
  }

  if (Object.keys(errors).length) {
    return json(errors, { status: 422 });
  }

  // @ts-ignore
  return redirect(`/onboard/mint`);
};

const OnboardDisplayname = () => {
  const { displayname: storedDisplayname } = useLoaderData();
  const [displayname, setDisplayname] = useState(storedDisplayname || "");

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load(`/onboard/mint/load-voucher`);
    }
  }, [fetcher]);

  const actionErrors = useActionData();
  const transition = useTransition();

  return (
    <>
      <ol role="list" className="mx-auto flex items-center space-x-5">
        <li>
          <a href={"/onboard/name"} className="relative flex items-center justify-center" aria-current="step">
            <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
              <span className="h-full w-full rounded-full bg-indigo-200" />
            </span>
            <span className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span className="sr-only">{"Display Name"}</span>
          </a>
        </li>

        <li>
          <a href="/onboard/mint" className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
            <span className="sr-only">{"Mint"}</span>
          </a>
        </li>

        <li>
          <a href="/onboard/ens" className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
            <span className="sr-only">{"ENS"}</span>
          </a>
        </li>
      </ol>

      <Heading className="flex flex-1 text-center justify-center items-center">What should we call you?</Heading>

      <Form method="post"
        className="flex flex-1 flex-col justify-center items-center"
      >

        <section
          id="onboard-displayname-form"
          className="flex-1 justify-center items-center items-stretch self-center"
        >
          <Label htmlFor="display-name">
            <Text
              className="mb-1.5"
              size={TextSize.SM}
              weight={TextWeight.Medium500}
              color={TextColor.Gray700}
            >
              *Display Name
            </Text>

            {actionErrors?.displayname && (
              <Text
                className="mb-1.5"
                size={TextSize.XS}
                weight={TextWeight.Regular400}
                color={TextColor.Gray400}
              >
                {actionErrors.displayname}
              </Text>
            )}
          </Label>

          <TextInput
            id="displayname"
            name="displayname"
            type="text"
            placeholder="Ash"
            autoFocus={true}
            required={true}
            onChange={(event) => setDisplayname(event.target.value)}
            value={displayname}
            helperText={
              <Text
                type="span"
                className="mt-2"
                size={TextSize.XS}
                weight={TextWeight.Regular400}
                color={TextColor.Gray400}
              >
                You can always change this later in the settings
              </Text>
            }
          />
        </section>

        <section
          id="onboard-displayname-actions"
          className="flex flex-1 justify-end w-full items-end space-x-4 pt-10 lg:pt-0"
        >
          {transition.state === "submitting" || transition.state === "loading" ? <Spinner /> :
            <Button
              isSubmit={true}
              disabled={!displayname || displayname === ""}
              size={ButtonSize.L}
            >
              Continue
            </Button>
          }
        </section>

      </Form>
      <PrefetchPageLinks page="/onboard/mint" />
    </>
  );
};

export default OnboardDisplayname;
