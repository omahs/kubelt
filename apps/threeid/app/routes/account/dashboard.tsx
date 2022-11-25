import { json, redirect } from '@remix-run/cloudflare'

import { useLoaderData, useSubmit } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { FaDiscord, FaTwitter, FaCaretUp } from 'react-icons/fa'

import { getUserSession, requireJWT } from '~/utils/session.server'
import { oortSend } from '~/utils/rpc.server'
import datadogRum from '~/utils/datadog.client'

import FAQ from '~/components/FAQ'

import stepComplete from '~/assets/step_complete.png'
import stepSoon from '~/assets/step_soon.png'
import { Text } from '@kubelt/design-system'
import Heading from '~/components/typography/Heading'
import SectionTitle from '~/components/typography/SectionTitle'
import SectionHeading from '~/components/typography/SectionHeading'
import SectionHeadingSubtle from '~/components/typography/SectionHeadingSubtle'
import { ButtonAnchor } from '~/components/buttons'
import { getGalaxyClient } from '~/helpers/galaxyClient'

// @ts-ignore
export const loader = async ({ request }) => {
  console.log('in dashboard loader')
  const jwt = await requireJWT(request, '/auth')

  const oortOptions = {
    jwt: jwt,
  }

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  // TODO remove session address param when RPC url is changed
  const [votesRes] = await Promise.all([
    oortSend('kb_getObject', ['3id.app', 'feature_vote_count'], oortOptions),
  ])

  const [votes, isToken, displayname] = [
    votesRes.result,
    profileRes.profile?.pfp.isToken,
    profileRes.profile?.displayName,
  ]

  return json({
    votes,
    isToken,
    displayname,
    profile: profileRes.profile,
  })
}

export const action = async ({ request }: any) => {
  const votes = (await request.formData()).get('votes')
  const session = await getUserSession(request)
  const jwt = session.get('jwt')

  oortSend(
    'kb_putObject',
    [
      '3id.app',
      'feature_vote_count',
      votes,
      {
        visibility: 'private',
      },
    ],
    {
      jwt,
    }
  )
  return json({ votes })
}

const completeSteps = [
  {
    title: 'Claim your 3ID',
    isCompleted: true,
  },
  {
    title: 'Claim your PFP',
    isCompleted: false,
    description: (
      <>
        <Text
          className="mb-1 text-gray-400"
          size="sm"
          weight="normal"
        >
          Mint your very own 3ID 1/1 PFP.
        </Text>
        <a href="/onboard/mint">Click here to complete.</a>
      </>
    ),
  },
  {
    title: 'Configure Profile',
    description: (
      <>
        <Text
          className="mb-1 text-gray-400"
          size="sm"
          weight="normal"
        >
          Configure your NFT avatar and profile.
        </Text>
        <a href="/account/settings">Click here to complete.</a>
      </>
    ),
  },
]

const comingNext = [
  {
    title: 'Link More Accounts',
    description: (
      <>
        <Text
          className="mb-1 text-gray-400"
          size="sm"
          weight="normal"
        >
          Connect more blockchain and social accounts to your 3ID.
        </Text>
      </>
    ),
  },
]

const roadmapSteps = [
  {
    title: 'Setup Address Profiles',
  },
  {
    title: 'Permission First App',
  },
  {
    title: 'Create NFT gallery',
  },
  {
    title: 'Receive First Credential',
  },
  {
    title: 'Setup Secure KYC',
  },
  {
    title: 'Send First Message',
  },
  {
    title: 'Save First File',
  },
]

export default function Welcome() {
  console.log('dashboard welcome component')
  const { votes, isToken, displayname, profile } = useLoaderData()
  let submit = useSubmit()

  completeSteps[1].isCompleted = isToken
  completeSteps[2].isCompleted = Object.keys(profile || {}).length > 1

  const percentage =
    (completeSteps.filter((step) => step.isCompleted).length /
      (completeSteps.length + comingNext.length + roadmapSteps.length)) *
    100

  const currentVotes = votes?.value ? JSON.parse(votes.value) : []

  const [featureVotes, setFeatureVotes] = useState<Set<string>>(
    currentVotes.length ? new Set<string>(currentVotes) : new Set<string>()
  )

  useEffect(() => {
    submit(
      { votes: JSON.stringify(Array.from(featureVotes)) },
      { action: '', method: 'post' }
    )
  }, [featureVotes])

  return (
    <div className="dashboard flex flex-col gap-4">
      <div
        className="welcome-banner basis-full"
        style={{
          backgroundColor: '#F9FAFB',
          padding: '30px 30px 23px 16px',
        }}
      >
        <Heading className="mb-3 flex flex-col lg:flex-row gap-4">
          <span className="order-2 text-center justify-center align-center lg:order-1">
            Congratulations, {displayname}!
          </span>
          <span className="order-1 text-center justify-center align-center lg:order-2">
            🎉
          </span>
        </Heading>

        <Text
          weight="normal"
          size="base"
          className="mb-6 text-center lg:text-left text-gray-500"
        >
          Welcome to the 3ID app. We are currently in beta and will be unlocking
          new features often. Follow us on Twitter and join our Discord to stay
          updated!
        </Text>

        <div className="flex flex-row gap-4 justify-center align-center lg:justify-start">
          <ButtonAnchor
            href="https://twitter.com/threeid_xyz"
            Icon={FaTwitter}
            iconColor="#1D9BF0"
          >
            Twitter
          </ButtonAnchor>

          <ButtonAnchor
            href="https://discord.gg/threeid"
            Icon={FaDiscord}
            iconColor="#5865F2"
          >
            Discord
          </ButtonAnchor>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="invite basis-full lg:basis-6/12 order-2 lg:order-2">
          <div className="roadmap-vote">
            <SectionHeadingSubtle
              title="Tell us what's next"
              subtitle={`Vote for your favorite features (${
                3 - featureVotes.size
              } votes left)`}
            />

            <div className="roadmap-vote__steps steps grid grid-rows gap-4">
              {roadmapSteps.map((step, index) => (
                <div
                  className="roadmap-vote__step step flex flex-row gap-4 items-center"
                  key={index}
                >
                  <button
                    className="roadmap-vote__button mt-1 flex items-center justify-center"
                    disabled={
                      featureVotes.size >= 3 || featureVotes.has(step.title)
                        ? true
                        : false
                    }
                    onClick={(e) => {
                      featureVotes.add(step.title)
                      setFeatureVotes(new Set(featureVotes))
                      datadogRum.addAction('featureVote', {
                        value: step.title,
                      })
                    }}
                  >
                    <FaCaretUp />
                  </button>
                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="roadmap basis-full lg:basis-6/12 order-1 lg:order-1">
          <SectionTitle
            title="Roadmap"
            subtitle="Discover and try new features as we roll them out"
          />

          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="roadmap-ready">
            <SectionHeadingSubtle title="Ready" />

            <div className="roadmap-ready__steps steps grid grid-rows gap-4">
              {completeSteps.map((step, index) => (
                <div
                  className="roadmap-next__step step flex flex-row gap-4 items-start"
                  key={index}
                >
                  <div className="roadmap-next__check mt-1 flex justify-center items-top">
                    <img
                      src={step.isCompleted ? stepComplete : stepSoon}
                      alt="3ID Step"
                    />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading>{step.title}</SectionHeading>
                    <div className="col-span-5">
                      <Text
                        size="sm"
                        weight="normal"
                        className="text-gray-500"
                      >
                        {step.isCompleted ? 'Completed' : step.description}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="roadmap-next">
            <SectionHeadingSubtle title="Coming next" />

            <div className="roadmap-next__steps steps grid grid-rows gap-4">
              {comingNext.map((step, index) => (
                <div
                  className="roadmap-next__step step flex flex-row gap-4 items-start"
                  key={index}
                >
                  <div className="roadmap-next__check mt-1 flex justify-center items-top">
                    <img src={stepSoon} alt="3ID Step" />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
                    <div className="col-span-5">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="faq basis-full lg:basis-6/12 lg:hidden order-3"></div>
      </div>
      <FAQ />
    </div>
  )
}
