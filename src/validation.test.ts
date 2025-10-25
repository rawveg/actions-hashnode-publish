import { describe, it, expect } from 'vitest'
import { validateMarkdown, parseMarkdown } from './validation'

describe('validateMarkdown', () => {
  it('should validate a correct markdown file', () => {
    const content = `---
title: "Test Article"
tags: ["test", "markdown"]
---

This is the content of the article. It has more than 50 characters and is in markdown format.`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should reject markdown without title', () => {
    const content = `---
tags: ["test"]
---

Content.`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title is required')
  })

  it('should reject markdown with too many tags', () => {
    const content = `---
title: "Test Article"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
---

Content.`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Maximum of 5 tags allowed')
  })

  it('should reject markdown with non-string tags', () => {
    const content = `---
title: "Test Article"
tags: ["tag1", 123]
---

Content.`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Tags must be strings')
  })

  it('should reject markdown with tags that are too long', () => {
    const content = `---
title: "Test Article"
tags: ["averylongtagthatexceedsmaxlength"]
---

Content.`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Tag "averylongtagthatexceedsmaxlength" must be less than 20 characters')
  })

  it('should reject markdown with empty content', () => {
    const content = `---
title: "Test Article"
tags: ["test"]
---`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Content cannot be empty')
  })

  it('should reject markdown with content that is too short', () => {
    const content = `---
title: "Test Article"
tags: ["test"]
---

Short.`
    const result = validateMarkdown(content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Content must be at least 50 characters')
  })
})

describe('parseMarkdown', () => {
  it('should parse markdown correctly', () => {
    const content = `---
title: "Test Article"
tags: ["test", "markdown"]
articleId: "article123"
draftId: "draft456"
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article',
      subtitle: undefined,
      content: 'This is the content.',
      tags: ['test', 'markdown'],
      articleId: 'article123',
      draftId: 'draft456',
      canonicalUrl: undefined,
      coverImage: undefined
    })
  })

  it('should handle markdown without tags', () => {
    const content = `---
title: "Test Article"
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article',
      subtitle: undefined,
      content: 'This is the content.',
      tags: [],
      articleId: undefined,
      draftId: undefined,
      canonicalUrl: undefined,
      coverImage: undefined
    })
  })

  it('should parse markdown with canonicalUrl and coverImage', () => {
    const content = `---
title: "Test Article"
tags: ["test"]
canonicalUrl: "https://example.com/original"
coverImage: "https://example.com/cover.jpg"
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article',
      subtitle: undefined,
      content: 'This is the content.',
      tags: ['test'],
      articleId: undefined,
      draftId: undefined,
      canonicalUrl: 'https://example.com/original',
      coverImage: 'https://example.com/cover.jpg'
    })
  })

  it('should parse subtitle from explicit frontmatter field', () => {
    const content = `---
title: "Test Article"
subtitle: "Test Subtitle"
tags: ["test"]
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article',
      subtitle: 'Test Subtitle',
      content: 'This is the content.',
      tags: ['test'],
      articleId: undefined,
      draftId: undefined,
      canonicalUrl: undefined,
      coverImage: undefined
    })
  })

  it('should parse subtitle from title with colon separator', () => {
    const content = `---
title: "Test Article: Test Subtitle"
tags: ["test"]
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article',
      subtitle: 'Test Subtitle',
      content: 'This is the content.',
      tags: ['test'],
      articleId: undefined,
      draftId: undefined,
      canonicalUrl: undefined,
      coverImage: undefined
    })
  })

  it('should handle multiple colons in title correctly', () => {
    const content = `---
title: "Test Article: Subtitle Part 1: Subtitle Part 2"
tags: ["test"]
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article',
      subtitle: 'Subtitle Part 1: Subtitle Part 2',
      content: 'This is the content.',
      tags: ['test'],
      articleId: undefined,
      draftId: undefined,
      canonicalUrl: undefined,
      coverImage: undefined
    })
  })

  it('should prefer explicit subtitle over title parsing', () => {
    const content = `---
title: "Test Article: Title Subtitle"
subtitle: "Explicit Subtitle"
tags: ["test"]
---

This is the content.`
    const result = parseMarkdown(content)
    expect(result).toEqual({
      title: 'Test Article: Title Subtitle',
      subtitle: 'Explicit Subtitle',
      content: 'This is the content.',
      tags: ['test'],
      articleId: undefined,
      draftId: undefined,
      canonicalUrl: undefined,
      coverImage: undefined
    })
  })
})
