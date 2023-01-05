import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useParams,
} from '@remix-run/react'

import { ThreeIdButton } from '~/components'

import globalStyles from '@kubelt/design-system/src/styles/global.css'
import styles from './styles/tailwind.css'

import appleIcon from '~/assets/apple-touch-icon.png'
import icon32 from '~/assets/favicon-32x32.png'
import icon16 from '~/assets/favicon-16x16.png'
import faviconSvg from '~/assets/three-id-logo.svg'
import social from '~/assets/passport-social.png'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'

function Analytics(props) {
  return (
    <script>
      window.dataLayer = window.dataLayer || []
      function gtag(){dataLayer.push(arguments)}
      gtag('js', new Date())
      gtag('config', props.tag)
    </script>
  )
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: '3ID - Passport',
  viewport: 'width=device-width,initial-scale=1',
  'og:url': 'https://passport.kubelt.com',
  'og:description': 'User identity in your control.',
  'og:image': social,
  'twitter:card': 'summary_large_image',
  'twitter:site': '@threeid_xyz',
  'twitter:creator': '@threeid_xyz',
  'theme-color': '#673ab8',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-capable': 'yes',
})

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'apple-touch-icon', href: appleIcon, sizes: '180x180' },
  { rel: 'icon', type: 'image/png', href: icon32, sizes: '32x32' },
  { rel: 'icon', type: 'image/png', href: icon16, sizes: '16x16' },
  { rel: 'shortcut icon', type: 'image/svg+xml', href: faviconSvg },
]

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      THREEID_APP_URL,
      INTERNAL_GOOGLE_ANALYTICS_TAG,
      APIKEY_ALCHEMY_PUBLIC: APIKEY_ALCHEMY_PUBLIC,
    },
  })
}

export default function App() {
  const browserEnv = useLoaderData()
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body style={{ backgroundColor: '#F9FAFB' }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
        <script
          async
          src="https://unpkg.com/flowbite@1.5.4/dist/flowbite.js"
        ></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG}"></script>
        <Analytics tag={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG} />
      </body>
    </html>
  )
}

// https://remix.run/docs/en/v1/guides/errors
// @ts-ignore
export function ErrorBoundary({ error }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="min-h-[100dvh] flex justify-center items-center">
        <div className="w-full">
          <ErrorPage
            code="Error"
            message="Something went terribly wrong!"
            trace={error?.stack}
          />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
        <script async src="https://www.googletagmanager.com/gtag/js?id={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG}"></script>
        <Analytics tag={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG} />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const browserEnv = useLoaderData()
  const caught = useCatch()
  const params = useParams()
  const { status } = caught

  let secondary = 'Something went wrong'
  switch (status) {
    case 404:
      secondary = 'Page not found'
      break
    case 400:
      secondary = 'Bad Request'
      break
    case 500:
      secondary = 'Internal Server Error'
      break
  }
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className={'flex flex-col h-screen gap-4 justify-center items-center'}
        >
          <h1>{status}</h1>
          <p>
            {secondary}
            {caught.data?.message && `: ${caught.data?.message}`}
          </p>
          {caught.data?.isAuthenticated && (
            <ThreeIdButton
              text={'Continue to 3ID'}
              href={typeof window !== 'undefined' && window.ENV.THREEID_APP_URL}
            />
          )}
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv?.ENV)}`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG}"></script>
        <Analytics tag={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG} />
      </body>
    </html>
  )
}
