import { createAdminClient } from './appwrite'

export async function getScreenshot(
  url: string,
  width?: number,
  height?: number,
  sleep?: number,
) {
  try {
    const { avatars } = createAdminClient()

    return await avatars.getScreenshot({
      url,
      width,
      height,
      viewportWidth: width,
      viewportHeight: height,
      sleep,
    })
  } catch (error) {
    console.error('Error getting screenshot:', error)
    throw error
  }
}
