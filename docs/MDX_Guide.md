# MDX Guide

This document explains how to write MDX in this repo, with examples for common tasks like headings, emphasis, images, math, and problems.

## What is MDX?

MDX is Markdown with JSX. You can use normal Markdown syntax and also embed React components like <Problems />.

## Frontmatter (required)

Every MDX file in content/ starts with frontmatter. Example:

---
id: algebra-basics
title: Algebra Basics
author: USAMO Guide Team
description: Linear equations, factoring, and manipulating expressions with confidence.
prerequisites: []
---

Notes:
- id must be unique.
- title is the page title.
- description is used in previews/SEO.
- prerequisites is a list of topic ids.

## Headings and structure

Use # only for the page title in frontmatter. Use ## and below for sections:

## Overview
### Key Ideas
#### Common Pitfalls

## Bold, italics, and inline code

**Bold text**
*Italic text*
`inline code`

## Lists

- Bullet item
- Another item

1. Numbered item
2. Another numbered item

## Links

[USAMO Guide](https://usamoguide.com)

## Images

Markdown image:

![Alt text](https://picsum.photos/200/300)

JSX image (MDX):

<img src="https://picsum.photos/200/300" alt="Alt text" />

If the image is stored in the repo (recommended), use a site-relative path like:

![Alt text](/images/example.png)

## Math (KaTeX)

Inline math uses single $:

Let $a^2 + b^2 = c^2$.

Block math uses $$:

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## Adding problems

Use the Problems component to add practice sets. Example:

<Problems problems="practice" />

Common values for problems are typically "practice" or other predefined groups for the module.

## Embedding other components

MDX supports React components used by the site. Example patterns:

<ComponentName prop1="value" />

Only components supported by the site will render properly.

## Tips

- Keep lines reasonably short for readability in reviews.
- Prefer images stored in the repo over hotlinking.
- Use math for formulas instead of inline ASCII.
