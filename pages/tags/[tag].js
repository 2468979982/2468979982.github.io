import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import fs from 'fs'
import path from 'path'

const root = process.cwd()

export async function getStaticPaths() {
  const tags = await getAllTags('blog')

  return {
    paths: Object.keys(tags).map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter('blog')
  
  // Filter out invalid posts first
  const validPosts = allPosts.filter((post) => post && post.slug)
  
  const filteredPosts = validPosts.filter((post) => {
    const normalizedTags = Array.isArray(post.tags)
      ? post.tags.map((t) => (t ? kebabCase(t) : '')).filter(Boolean)
      : []
    return post.draft !== true && normalizedTags.includes(params.tag)
  })

  // rss - generate in try-catch to prevent build failure
  try {
    if (filteredPosts.length > 0) {
      const rss = generateRss(filteredPosts, `tags/${params.tag}/feed.xml`)
      const rssPath = path.join(root, 'public', 'tags', params.tag)
      fs.mkdirSync(rssPath, { recursive: true })
      fs.writeFileSync(path.join(rssPath, 'feed.xml'), rss)
    }
  } catch (error) {
    console.error(`Failed to generate RSS for tag ${params.tag}:`, error)
  }

  return { props: { posts: filteredPosts, tag: params.tag } }
}

export default function Tag({ posts, tag }) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.author}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}
