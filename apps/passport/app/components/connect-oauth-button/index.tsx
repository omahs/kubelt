// import { Form } from '@remix-run/react'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import appleIcon from '@kubelt/design-system/src/assets/social_icons/apple.svg'
import githubIcon from '@kubelt/design-system/src/assets/social_icons/github.svg'
import googleIcon from '@kubelt/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@kubelt/design-system/src/assets/social_icons/microsoft.svg'
import twitterIcon from '@kubelt/design-system/src/assets/social_icons/twitter.svg'

type OAuthProvider = 'apple' | 'github' | 'google' | 'microsoft' | 'twitter'

// Can possibly be replaced with
// react-icons
const providerIconDict: { [key in OAuthProvider]: string } = {
  apple: appleIcon,
  github: githubIcon,
  google: googleIcon,
  microsoft: microsoftIcon,
  twitter: twitterIcon,
}

type ConnectOAuthButtonProps = {
  provider: OAuthProvider
}

const ConnectOAuthButton = ({ provider }: ConnectOAuthButtonProps) => (
  <form className="w-full" action={`/authenticate/${provider}`} method="post">
    <Button className={'w-full'} btnType={'secondary-alt'} isSubmit={true}>
      <div className="flex justify-center items-center w-full py-1.5">
        <img
          className="w-5 h-5"
          src={providerIconDict[provider]}
          alt={provider}
        />
      </div>
    </Button>
  </form>
)

export default ConnectOAuthButton
