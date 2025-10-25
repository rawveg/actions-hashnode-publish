import matter from 'gray-matter'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ArticleMetadata {
  title: string
  subtitle?: string
  content: string
  tags: string[]
  articleId?: string
  draftId?: string
  canonicalUrl?: string
  coverImage?: string
}

export function validateMarkdown(content: string): ValidationResult {
  const errors: string[] = []
  const { data: frontmatter, content: markdownContent } = matter(content)

  // Validate title
  if (!frontmatter.title) {
    errors.push('Title is required')
  } else if (typeof frontmatter.title !== 'string') {
    errors.push('Title must be a string')
  } else if (frontmatter.title.length > 100) {
    errors.push('Title must be less than 100 characters')
  }

  // Validate tags
  if (!Array.isArray(frontmatter.tags)) {
    errors.push('Tags must be an array')
  } else {
    if (frontmatter.tags.length > 5) {
      errors.push('Maximum of 5 tags allowed')
    }
    frontmatter.tags.forEach((tag: unknown) => {
      if (typeof tag !== 'string') {
        errors.push('Tags must be strings')
      } else if (tag.length > 20) {
        errors.push(`Tag "${tag}" must be less than 20 characters`)
      }
    })
  }

  // Validate content
  const trimmedContent = markdownContent.trim()
  if (!trimmedContent) {
    errors.push('Content cannot be empty')
  } else if (trimmedContent.length < 50) {
    errors.push('Content must be at least 50 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function parseMarkdown(content: string): ArticleMetadata {
  const { data: frontmatter, content: markdownContent } = matter(content)
  
  // Parse title and subtitle
  let title = frontmatter.title || ''
  let subtitle = frontmatter.subtitle
  
  // If subtitle is not explicitly provided, check if title contains ": " separator
  if (!subtitle && title.includes(': ')) {
    const parts = title.split(': ')
    title = parts[0]
    subtitle = parts.slice(1).join(': ') // Handle cases where subtitle might also contain ": "
  }
  
  return {
    title,
    subtitle,
    content: markdownContent.trim(),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    articleId: frontmatter.articleId,
    draftId: frontmatter.draftId,
    canonicalUrl: frontmatter.canonicalUrl,
    coverImage: frontmatter.coverImage,
  }
}
