---
_schema: homepage
title: Accessible Astro Starter - Build Faster, More Inclusive Websites
description: An Accessible Starter Theme for Astro including several accessibility features and tools to help you build faster.
hero:
  title: Starter for Astro
  gradient_text: Accessible
  image: /astronaut-hero-img.webp
  buttons:
    - label: Star on GitHub
      href: https://github.com/incluud/accessible-astro-starter
      type: primary
      icon: lucide:star
    - label: Read the docs
      href: https://accessible-astro.incluud.dev/
      type: secondary
      icon: lucide:bookmark
features:
  - icon: lucide:accessibility
    title: Accessible by default
    description: Keyboard navigation, focus indicators, ARIA labels, semantic HTML, and more. This theme is designed to be inclusive.
  - icon: lucide:puzzle
    title: A11Y components
    description: 35+ components and counting, all tried and tested for the most optimal accessible experience for your visitors.
  - icon: lucide:moon
    title: Dark mode
    description: Fully integrated Dark mode gives your users the choice for their favorite viewing mode.
  - icon: lucide:paintbrush
    title: Tailwind 4.0
    description: Use the power of Tailwind to greatly improve your productivity and enhance your developer workflow.
  - icon: lucide:sparkles
    title: Prettier
    description: Less worry about formatting your code, let the Astro Prettier integration do the heavy lifting.
  - icon: lucide:code
    title: ESLint
    description: Lint your code with strict a11y settings to ensure you stay on track with the WCAG standards.
  - icon: lucide:bookmark
    title: Blog & portfolio
    description: This theme comes with a fully integrated blog and portfolio, dynamic pages and SEO optimization.
  - icon: lucide:file-text
    title: Markdown & MDX
    description: Easily use .md and .mdx pages to build your websites or use it with a CMS.
  - icon: lucide:blocks
    title: Design system
    description: The theme offers some very handy utilities to help you build your website faster.
content_sections:
  - image: /accessible-components.webp
    heading: Accessible components
    content: >-
      This theme provides plenty of tried and tested Accessible Astro Components. Some are native to this theme and a
      lot of others are integrated using a separate package. They'll get you up and running in building an accessible
      solution for your visitors.
    reverse_image: false
  - image: /wcag-compliant.webp
    heading: WCAG 2.2 AA compliant
    content: >-
      Using semantic HTML, landmarks, skip links, screen reader friendly content, aria-labels, keyboard accessible
      navigation and components, clear outlines and tab indicators and the right color contrast, you're more certain of
      reaching WCAG AA compliance.
    reverse_image: true
show_featured_projects: true
show_featured_posts: true
faq:
  title: FAQ
  description: >-
    This section demonstrates how to effectively use the Accordion component to organize and display frequently
    asked questions in an accessible and user-friendly way.
  link_text: Contact support team
  link_href: /faq
  items:
    - title: What is WCAG and why is it important?
      content: >-
        WCAG (Web Content Accessibility Guidelines) is a set of internationally recognized standards for web
        accessibility. Following WCAG ensures your website is usable by people with various disabilities,
        including visual, auditory, physical, and cognitive impairments. It's important not just for
        accessibility, but also for legal compliance, SEO, and reaching a wider audience.
    - title: What's the difference between ARIA labels and alt text?
      content: >-
        Alt text is specifically for describing images to screen reader users, while ARIA labels (aria-label,
        aria-labelledby) can describe any element on a page. Alt text is HTML's native way to provide alternative
        text for images, while ARIA labels are part of the ARIA specification that helps make dynamic content and
        advanced UI controls more accessible.
    - title: Why is keyboard navigation important?
      content: >-
        Keyboard navigation is essential for users who can't use a mouse, including people with motor
        disabilities, visual impairments, or those who simply prefer keyboard controls. A website should be fully
        operable using only a keyboard, with visible focus indicators and logical tab order. This includes being
        able to access all interactive elements and navigate through content efficiently.
    - title: What is a sufficient color contrast ratio?
      content: >-
        According to WCAG 2.2 AA standards, text should have a minimum contrast ratio of 4.5:1 against its
        background for regular text, and 3:1 for large text (18pt or 14pt bold). For non-text elements like icons
        or buttons, a minimum ratio of 3:1 is required. This ensures content is readable for users with visual
        impairments or color blindness.
    - title: How do I make custom components accessible?
      content: >-
        To make custom components accessible, focus on these key aspects: use semantic HTML where possible,
        implement proper keyboard support, add appropriate ARIA attributes, manage focus when needed, and ensure
        adequate color contrast. Always test with screen readers and keyboard navigation. Consider using
        established design patterns from the ARIA Authoring Practices Guide.
community:
  title: Our community
  description: >-
    We're a community of developers who are passionate about making the web more accessible. We're always looking
    for new ways to improve the accessibility of the web.
  members:
    - Robert Johnson
    - Maria Torres
    - Alex Kim
    - Sarah Lee
    - James Peterson
    - Lisa Wong
    - David Martinez
    - Emma Brown
    - Thomas Chen
counters_heading: Impact in numbers
counters:
  - count: "1.100+"
    title: Stars
    subtitle: On GitHub
  - count: "35+"
    title: Accessible
    subtitle: Components
  - count: "500+"
    title: Commits
    subtitle: Merged
  - count: "48+"
    title: Months
    subtitle: Since launch
---
