import ProfileNftCollections from '~/components/nft-collection/ProfileNftCollections'
import { useRouteData } from '~/hooks'

export type ProfileData = {
  targetAddress: string
  displayName: string
  isOwner: boolean
  pfp: {
    image: string
    isToken: string
  }
}
const ProfileRoute = () => {
  const { targetAddress, displayName, isOwner, pfp } =
    useRouteData<ProfileData>('routes/$profile')

  return (
    <>
      <ProfileNftCollections
        account={targetAddress}
        pfp={pfp.image}
        displayname={displayName}
        isOwner={isOwner}
        filters={true}
        detailsModal
      />
    </>
  )
}

export default ProfileRoute
