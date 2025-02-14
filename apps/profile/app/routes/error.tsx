import { useLoaderData } from "@remix-run/react";
import { 
    json,
} from "@remix-run/cloudflare";

// @ts-ignore
export const loader = async ({ request }) => {
    const url = new URL(request.url);
    const error = url.searchParams.get("error")
    return json({message: error});
};

export default function Error() {
    const error = useLoaderData();

    return (
        <div>
            <h1>ERROR</h1>
            <h2>{error.message}</h2>
        </div>
    )
}