# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VitePress-based documentation site for PX4 Autopilot guides. It serves as a document viewer that converts HTML content from the official PX4 documentation into a structured markdown format with proper navigation and search capabilities.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production assets for deployment
- `npm run serve` - Preview production build locally

### Package Manager
This project uses npm (not pnpm despite the configuration in package.json). The pnpm configuration exists only for dependency resolution rules.

## Architecture

### Project Structure
```
docs/                          # VitePress content root
├── .vitepress/               # VitePress configuration
│   ├── config.ts            # Main configuration file
│   └── theme/               # Custom theme
│       ├── index.js         # Theme entry point
│       └── custom.css       # Custom styling
├── index.md                 # Home page
├── public/                  # Static assets
└── version/                 # Versioned documentation
    └── main/               # Main version content
        ├── introduction/    # Introduction pages  
        └── documentation/   # Technical documentation

src/                          # Source HTML files (for reference)
├── PX4 Autopilot User Guide _ PX4 Guide (main).html
└── docs.px4.io/             # Downloaded PX4 documentation assets
```

### Configuration
- **VitePress Config**: `docs/.vitepress/config.ts` - Main configuration with navigation, sidebar, search, and Mermaid integration
- **Theme**: Extends default VitePress theme with minimal customizations
- **Search**: Uses local search provider with Korean localization
- **Mermaid**: Integrated via `vitepress-plugin-mermaid` for diagram support

### Content Organization
- Documentation is organized by version (`version/main/`)
- Navigation supports collapsible sections
- Korean language interface with English content
- Markdown files with line numbers enabled for code blocks

### Key Features
- Local search with Korean UI translations
- Mermaid diagram support
- Version-based navigation structure
- Responsive design with custom logo
- Korean search interface with English content

## Working with Content

### Adding New Documentation
1. Create markdown files in appropriate `version/main/` subdirectories
2. Update navigation in `docs/.vitepress/config.ts` sidebar configuration
3. Ensure proper frontmatter and markdown formatting
4. Use Mermaid syntax for diagrams where appropriate

### Styling Guidelines
- Custom styles go in `docs/.vitepress/theme/custom.css`
- Follow VitePress theming conventions
- Maintain responsive design principles

## Dependencies

### Core Dependencies
- `vitepress`: Static site generator
- `vue`: Vue.js framework (required by VitePress)
- `mermaid`: Diagram rendering
- `vitepress-plugin-mermaid`: Mermaid integration
- `markdown-it-mermaid`: Markdown Mermaid processing

### Development Notes
- Uses VitePress 1.0.0-alpha.28 (check for updates)
- Theme customization is minimal - leverages default VitePress theme
- Build output goes to `docs/.vitepress/dist/` (standard VitePress structure)