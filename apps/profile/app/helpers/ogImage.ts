import createImageClient from '@kubelt/platform-clients/image'

export const ogImageFromProfile = async (pfp: string) => {
  const imageClient = createImageClient(Images, { imagesURL: IMAGES_URL })
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}
