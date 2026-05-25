import { escape } from '@/lib/utils/htmlEscaper'

import siteMetadata from '@/data/siteMetadata'

const generateRssItem = (post) => {
  if (!post) return ''
  
  const { slug, title, date, summary, tags } = post
  
  return `
  <item>
    <guid>${siteMetadata.siteUrl}/blog/${slug ?? ''}</guid>
    <title>${escape(title ?? '')}</title>
    <link>${siteMetadata.siteUrl}/blog/${slug ?? ''}</link>
    ${summary ? `<description>${escape(summary)}</description>` : ''}
    <pubDate>${date ? new Date(date).toUTCString() : new Date().toUTCString()}</pubDate>
    <author>${escape(siteMetadata.email ?? '')} (${escape(siteMetadata.author ?? '')})</author>
    ${Array.isArray(tags)
      ? tags.filter(t => t).map((t) => `<category>${escape(t)}</category>`).join('') 
      : ''}
  </item>
`
}

const generateRss = (posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(siteMetadata.title ?? '')}</title>
      <link>${siteMetadata.siteUrl}/blog</link>
      <description>${escape(siteMetadata.description ?? '')}</description>
      <language>${escape(siteMetadata.language ?? '')}</language>
      <managingEditor>${escape(siteMetadata.email ?? '')} (${escape(siteMetadata.author ?? '')})</managingEditor>
      <webMaster>${escape(siteMetadata.email ?? '')} (${escape(siteMetadata.author ?? '')})</webMaster>
      <lastBuildDate>${posts.length > 0 && posts[0]?.date ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${siteMetadata.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map(generateRssItem).join('')}
    </channel>
  </rss>
`
export default generateRss
