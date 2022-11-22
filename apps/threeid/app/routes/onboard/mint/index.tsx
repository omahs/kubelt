import { ActionFunction, LoaderFunction, redirect } from '@remix-run/cloudflare'

import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import Heading from '~/components/typography/Heading'
import { Text } from '@kubelt/design-system'

import styles from '~/styles/onboard.css'

import { Button, ButtonSize, ButtonType } from '~/components/buttons'
import { BiInfoCircle } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import {
  useContractWrite,
  useAccount,
  useNetwork,
  useWaitForTransaction,
  useSwitchNetwork,
} from 'wagmi'
import { Spinner } from 'flowbite-react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'

import { loader as loadVoucherLoader } from '~/routes/onboard/mint/load-voucher'

import { abi } from '~/assets/abi/mintpfp.json'

import { getUserSession } from '~/utils/session.server'
import { Visibility } from '~/utils/galaxy.server'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient } from '~/helpers/galaxyClient'

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export const loader: LoaderFunction = loadVoucherLoader

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request)
  const jwt = session.get('jwt')
  const core = session.get('core')

  const formData = await request.formData()

  const imgUrl = formData.get('imgUrl')
  if (!imgUrl) {
    throw new Error('imgUrl expected')
  }

  const isToken = formData.get('isToken')

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateProfile(
    {
      profile: {
        pfp: {
          isToken: !!isToken,
          image: imgUrl.toString(),
        },
      },
      visibility: Visibility.Public,
    },
    {
      'KBT-Access-JWT-Assertion': jwt,
    }
  )
  // @ts-ignore
  await ONBOARD_STATE.put(core, 'complete')

  return redirect('/account')
}

type OnboardMintLandingProps = {
  account: string
  minted: boolean
  isInvalidAddress: boolean
  isInvalidChain: boolean
  onClick: () => void
}

const OnboardMintLand = ({
  account,
  minted,
  isInvalidAddress,
  isInvalidChain,
  onClick,
}: OnboardMintLandingProps) => {
  return (
    <>
      {!minted && !isInvalidChain && !isInvalidAddress && (
        <Button size={ButtonSize.L} onClick={onClick}>
          Mint NFT
        </Button>
      )}
      {isInvalidChain && (
        <Text
          className="mt-4 flex flex-row space-x-4 items-center text-gray-400"
          size="sm"
        >
          **Please select switch your network to{' '}
          {window.ENV.VALID_CHAIN_ID_NAME}**
        </Text>
      )}
      {isInvalidAddress && (
        <Text
          className="mt-4 flex flex-row space-x-4 items-center text-gray-400"
          size="sm"
        >
          **Please connect your wallet to {account}**
        </Text>
      )}
    </>
  )
}

type OnboardMintConnectProps = {
  onClick: () => void
}

const OnboardMintConnect = ({ onClick }: OnboardMintConnectProps) => {
  return (
    <>
      <Button size={ButtonSize.L} onClick={onClick} disabled>
        Try Again
      </Button>

      <Text
        className="mt-4 flex flex-row space-x-4 items-center text-gray-400"
        size="sm"
      >
        **Please unlock your wallet to mint your NFT**
      </Text>
    </>
  )
}

type OnboardMintSignProps = {
  isLoading: boolean
  onClick: () => void
}

const OnboardMintSign = ({ onClick, isLoading }: OnboardMintSignProps) => {
  return (
    <>
      <Text className="mb-10 text-gray-400">
        Please confirm the transaction in your wallet or
      </Text>

      <Button size={ButtonSize.L} onClick={onClick}>
        Try Again
      </Button>
    </>
  )
}

const OnboardMintProc = () => {
  return (
    <>
      <section className="flex flex-row justify-center items-center space-x-4 mb-10">
        <Spinner color="gray" size="lg" />

        <Text className="text-gray-400">Minting, please wait</Text>
      </section>
    </>
  )
}

type OnboardMintErrorProps = {
  onClick: () => void
}

const OnboardMintError = ({ onClick }: OnboardMintErrorProps) => {
  return (
    <>
      <section className="flex flex-row justify-center items-center space-x-4 mb-10">
        <HiXCircle color="#EF4444" />

        <Text className="text-gray-400">Something went wrong</Text>
      </section>

      <Button size={ButtonSize.L} onClick={onClick}>
        Try Again
      </Button>
    </>
  )
}

type OnboardMintSuccessProps = {
  data?: object
}

const OnboardMintSuccess = ({ data }: OnboardMintSuccessProps) => {
  return (
    <>
      <section className="flex flex-row justify-center items-center space-x-4 mb-10">
        <HiCheckCircle color="#10B981" />

        <Text className="text-gray-400">Minted successfully!</Text>
      </section>

      <Text className="text-gray-400" size="xs">
        <a href={`https://etherscan.io/tx/${data?.hash}`}>View on Etherscan</a>
      </Text>
    </>
  )
}

const OnboardMint = () => {
  const traitNames = {
    trait0: 'Generation',
    trait1: 'Priority',
    trait2: 'Friend',
    trait3: 'Points',
  }

  const [screen, setScreen] = useState<
    'land' | 'sign' | 'proc' | 'success' | 'error'
  >('land')

  const { metadata, voucher, contractAddress, minted } = useLoaderData()
  const account = metadata?.properties?.metadata.account
  const recipient = metadata?.properties?.metadata.account
  const [imgUrl, setImgUrl] = useState<string>(metadata?.image)
  const [invalidChain, setInvalidChain] = useState(false)

  const navigate = useNavigate()
  const transition = useTransition()
  const { chain } = useNetwork()
  const { pendingChainId, switchNetwork } = useSwitchNetwork()
  const { isConnected, address } = useAccount()

  const { data, write, isError } = useContractWrite({
    // https://github.com/wagmi-dev/wagmi/issues/899
    // https://github.com/wagmi-dev/wagmi/issues/891
    // https://github.com/wagmi-dev/wagmi/discussions/880#discussioncomment-3516226
    mode: 'recklesslyUnprepared',
    addressOrName: contractAddress,
    contractInterface: abi,
    functionName: 'awardPFP',
    args: [recipient, voucher],
  })
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })
  const submit = useSubmit()

  useEffect(() => {
    if (chain && chain.id != window.ENV.NFTAR_CHAIN_ID) {
      setInvalidChain(true)
    } else {
      setInvalidChain(false)
    }
  }, [chain])

  const [invalidAddress, setInvalidAddress] = useState(false)
  useEffect(() => {
    if (address && address !== account) {
      setInvalidAddress(true)
    } else {
      setInvalidAddress(false)
    }
  }, [address])

  useEffect(() => {
    if (screen === 'proc' && isError) {
      setScreen('error')
    } else if (screen === 'proc' && isSuccess) {
      setScreen('success')
    }
  }, [screen, isError, isSuccess])

  useEffect(() => {
    if (!isConnected && !minted) {
      setScreen('connect')
    }
  }, [isConnected, minted])

  useEffect(() => {
    //@ts-ignore
    if (switchNetwork && chain?.id != window.ENV.NFTAR_CHAIN_ID) {
      //@ts-ignore
      switchNetwork(`0x${window.ENV.NFTAR_CHAIN_ID}`)
    }
  }, [pendingChainId, switchNetwork])

  const signMessage = () => {
    if (write) write()
  }

  let screenActionComponent = null
  switch (screen) {
    case 'connect':
      screenActionComponent = (
        <OnboardMintConnect
          onClick={() => {
            window.location.reload()
          }}
        />
      )
      break
    case 'sign':
      screenActionComponent = (
        <OnboardMintSign
          isLoading={isLoading}
          onClick={() => {
            setScreen('land')
          }}
        />
      )
      break
    case 'proc':
      screenActionComponent = <OnboardMintProc />
      break
    case 'error':
      screenActionComponent = (
        <OnboardMintError
          onClick={() => {
            setScreen('land')
          }}
        />
      )
      break
    case 'success':
      screenActionComponent = <OnboardMintSuccess data={data} />
      break
    case 'land':
    default:
      screenActionComponent = (
        <OnboardMintLand
          account={account}
          minted={minted}
          isInvalidAddress={invalidAddress}
          isInvalidChain={invalidChain}
          onClick={() => {
            setScreen('proc')
            signMessage()
          }}
        />
      )
  }

  return (
    <>
      <ol role="list" className="mx-auto flex items-center space-x-5">
        <li>
          <a
            href="/onboard/name"
            className="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900"
          >
            <span className="sr-only">{'Display Name'}</span>
          </a>
        </li>

        <li>
          <a
            href={'/onboard/mint'}
            className="relative flex items-center justify-center"
            aria-current="step"
          >
            <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
              <span className="h-full w-full rounded-full bg-indigo-200" />
            </span>
            <span
              className="relative block h-2.5 w-2.5 rounded-full bg-indigo-600"
              aria-hidden="true"
            />
            <span className="sr-only">{'Mint'}</span>
          </a>
        </li>
      </ol>

      <Heading className="text-center">Congratulations!</Heading>

      <Text className="text-center text-gray-600">
        We just mathematically generated this 1/1 gradient PFP & cover photo for
        you.
      </Text>

      <Text className="text-center text-gray-600">
        You can mint this NFT for FREE - you only pay the gas fee.
      </Text>

      <section
        id="onboard-mint-form"
        className="flex-1 flex flex-col justify-center items-center"
      >
        <div className="flex flew-row justify-center items-center mb-10">
          {!imgUrl ? (
            <Spinner />
          ) : (
            <img src={gatewayFromIpfs(imgUrl)} className="w-24 h-24" />
          )}

          <Text className="mx-6">{'->'}</Text>

          <div
            className="w-24 h-24"
            style={{
              clipPath:
                'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
              boxShadow: 'inset 0px 10px 100px 10px white',
              transform: 'scale(1.2)',
            }}
          >
            <img src={gatewayFromIpfs(imgUrl)} className="w-24 h-24" />
          </div>
        </div>

        <Text
          className="mb-4 flex flex-row space-x-2 items-center text-gray-400"
        >
          <BiInfoCircle />
          <span>
            This image was generated using the assets in your{' '}
            <b className="cursor-default" title={account}>
              blockchain account.
            </b>
            <br />
          </span>
        </Text>
        <Text
          className="mb-4 flex flex-row space-x-2 items-center text-gray-400"
          size="xs"
        >
          <u>
            <i>
              <a
                onClick={() => {
                  let img = imgUrl
                  setImgUrl('')
                  setTimeout(() => {
                    setImgUrl(img)
                  }, 1000)
                }}
              >
                If image is not loading press here to refresh.
              </a>
            </i>
          </u>
        </Text>

        <ul
          role="list"
          className="mt-2 mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {[...Array(4).keys()].map((i) => {
            const r = metadata.properties.traits[`trait${i}`].value.rgb.r
            const g = metadata.properties.traits[`trait${i}`].value.rgb.g
            const b = metadata.properties.traits[`trait${i}`].value.rgb.b
            const bg = `rgb(${r}, ${g}, ${b})`
            return (
              <li
                key={i}
                className="col-span-1 flex flex-col rounded-md shadow-sm"
              >
                <div
                  style={{ fontSize: 12 }}
                  className="-mb-2 flex flex-1 font-bold text-gray-400 items-center truncate"
                >
                  {traitNames[`trait${i}`].toUpperCase()}
                </div>
                <div className="flex flex-1 grow items-center justify-between truncate rounded-md border border-gray-200 bg-white">
                  <div
                    className={
                      'flex-shrink-0 flex items-center justify-center text-white text-sm font-medium rounded-l-md'
                    }
                  >
                    <span
                      style={{
                        backgroundColor: bg,
                      }}
                      className="my-4 ml-1 rounded-md w-10 h-10"
                    ></span>
                  </div>
                  <div className="flex flex-1 items-center justify-between truncate bg-white">
                    <div className="flex-1 truncate px-4 py-4 text-sm">
                      <Text
                        size="sm"
                        className="font-bold text-gray-700"
                      >
                        {metadata.properties.traits[`trait${i}`].value.name}
                      </Text>
                      <Text
                        className="text-gray-400"
                        weight="medium"
                        size="xs"
                      >
                        {metadata.properties.traits[`trait${i}`].type[0] +
                          metadata.properties.traits[`trait${i}`].type
                            .toLowerCase()
                            .slice(1)}
                      </Text>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {screenActionComponent}

        {minted && <Text>Your PPF has already been minted</Text>}
      </section>

      <section
        id="onboard-ens-actions"
        className="flex justify-between lg:justify-end items-center space-x-4 pt-10 lg:pt-0"
      >
        {transition.state === 'submitting' || transition.state === 'loading' ? (
          <Spinner />
        ) : (
          <>
            {screen !== 'sign' && screen !== 'success' && screen !== 'proc' && (
              <>
                <Button
                  type={ButtonType.Secondary}
                  size={ButtonSize.L}
                  onClick={() => {
                    // @ts-ignore
                    navigate(`/onboard/name`)
                  }}
                >
                  Back
                </Button>

                <Button
                  type={ButtonType.Secondary}
                  size={ButtonSize.L}
                  onClick={() => {
                    submit(null, {
                      action: '/onboard/complete',
                      method: 'post',
                    })
                  }}
                >
                  Skip
                </Button>
              </>
            )}

            {screen === 'success' && (
              <Button
                type={ButtonType.Primary}
                size={ButtonSize.L}
                onClick={() => {
                  // Go back
                  submit(
                    {
                      imgUrl,
                      isToken: 'true',
                    },
                    {
                      action: '/onboard/mint?index',
                      method: 'post',
                    }
                  )
                }}
              >
                Continue
              </Button>
            )}
          </>
        )}
      </section>
    </>
  )
}

export default OnboardMint
