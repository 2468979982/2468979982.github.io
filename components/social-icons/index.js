import Mail from './mail.svg'
import Github from './github.svg'
import Facebook from './facebook.svg'
import Youtube from './youtube.svg'
import Linkedin from './linkedin.svg'
import Twitter from './twitter.svg'
import Juejin from './juejin.svg'
import CSDN from './csdn.svg'
import Book from './book.svg'
import Chemistry from './chemistry.svg'
import Educate from './educate.svg'
import Jianshu from './jianshu.svg'

// Icons taken from: https://simpleicons.org/

const components = {
  mail: Mail,
  github: Github,
  juejin: Juejin,
  csdn: CSDN,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  book: Book,
  chemistry: Chemistry,
  educate: Educate,
  jianshu: Jianshu,
}

const SocialIcon = ({ kind, href, size = 8, noLink = false }) => {
  if (!href || (kind === 'mail' && !/^mailto:\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(href)))
    return null

  const SocialSvg = components[kind]

  const content = (
    <>
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`fill-current text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 h-${size} w-${size}`}
      />
    </>
  )

  if (noLink) {
    return content
  }

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      {content}
    </a>
  )
}

export default SocialIcon
