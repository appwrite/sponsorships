export type OGImageConfig = {
  isCustom: boolean
  title?: string
  description?: string
  image?: string
  icon?: string
  width?: number
  height?: number
  backgroundColor?: string
  titleColor?: string
  descriptionColor?: string
  fontSize?: {
    title: number
    description: number
  }
  borderRadius?: number
}

export type OGMetaTags = {
  title: string
  description: string
  image: string
  url: string
  type?: 'website' | 'article' | 'profile'
  twitterHandle?: string
}

export const defaultCustomOGConfig: OGImageConfig = {
  isCustom: true,
  title: 'Hosting a hackathon?',
  description: 'Get $50 Appwrite Cloud credits for all your attendees',
  width: 1200,
  height: 630,
  backgroundColor: '#19191d',
  titleColor: '#ffffff',
  descriptionColor: '#adadb8',
  fontSize: {
    title: 56,
    description: 28,
  },
  borderRadius: 12,
}

export function generateOGImageUrl(
  config: Partial<OGImageConfig>,
  baseUrl: string,
): string {
  const defaultOGUrl = `${baseUrl.replace(/\/$/, '')}/og`

  if (!config.isCustom) {
    return defaultOGUrl
  }

  const merged = { ...defaultCustomOGConfig, ...config }

  const params = new URLSearchParams({
    ...(merged.title && { title: merged.title }),
    ...(merged.description && { description: merged.description }),
    ...(merged.image && { image: merged.image }),
    ...(merged.backgroundColor && { bgColor: merged.backgroundColor }),
    ...(merged.titleColor && { titleColor: merged.titleColor }),
    ...(merged.descriptionColor && {
      descriptionColor: merged.descriptionColor,
    }),
    ...(merged.fontSize?.title && {
      titleSize: merged.fontSize.title.toString(),
    }),
    ...(merged.fontSize?.description && {
      descSize: merged.fontSize.description.toString(),
    }),
  })

  return `${defaultOGUrl}?${params.toString()}`
}

export function createOGMetaTags(config: OGMetaTags) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    twitterHandle,
  } = config

  return {
    meta: [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      ...(twitterHandle
        ? [{ name: 'twitter:creator', content: twitterHandle }]
        : []),
      { name: 'description', content: description },
    ],
  }
}
