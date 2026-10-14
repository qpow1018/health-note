const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be']

export function isYoutubeUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      YOUTUBE_HOSTS.includes(url.hostname) &&
      url.username === '' && url.password === '' &&
      url.pathname !== '/'
    )
  } catch {
    return false
  }
}
