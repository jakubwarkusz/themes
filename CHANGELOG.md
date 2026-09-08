# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- _(themes)_ Add opt-in extended providers
- _(themes)_ Pair createThemes with NextThemeProvider and ThemeScript

### Fixed

- _(next)_ Keep theme provider in app shells
- _(next)_ Add metadata for tenant pages
- _(themes)_ Stabilize provider initialization and bootstrap parity
- _(docs)_ Trim unused theme exports and use dvh height
- _(ci)_ Clear audit advisories and build library before docs tests
- _(tooling)_ Keep generated script-source out of oxfmt
- _(tooling)_ Restore library build before docs tests in verify
- _(themes)_ Keep setTheme off useEffectEvent for oxlint
- _(themes)_ Satisfy exactOptionalPropertyTypes in extended providers
- _(themes)_ Adapt extended provider tests after rebase onto main
- _(themes)_ Satisfy oxfmt and oxlint after rebase onto main
- _(themes)_ Carry merged-PR review feedback into extended providers
- _(tooling)_ Sync pnpm lockfile with oxfmt/oxlint bumps
- _(docs)_ Keep Vercel on pinned Bun and use pnpm --filter
- _(provider)_ Keep the skip/memo pattern inside bundle budgets
- Unify bootstrap and runtime theme DOM apply
- Re-apply theme after Instant Navigation restores the DOM
- Restore theme when Instant Navigation clears html class
- Observe document replacements during Instant Navigation
- Narrow Instant Navigation observers and keep nested providers subscribed
- Keep html theme across Instant Navigation descendant restores
- Format getScript slice offsets for oxfmt
- Reclaim next-provider gzip under the 3.91 KiB ceiling
- Update documentation for clarity and consistency

### Performance

- _(themes)_ Reclaim bundle budget headroom without raising limits
- _(docs)_ Keep Analytics and below-fold home JS off the critical path
- _(provider)_ Apply theme once per toggle and keep context identity stable
- Omit cookie-parser bytecode from the default inline bootstrap

### Documentation

- _(themes)_ Add upgrading-from-1.x layout example
- _(themes)_ Call out TypeScript 5.9 peer requirement
- _(themes)_ Document upstream compatibility features
- _(themes)_ Dogfood package in documentation app
- Add contributor and agent guidance
- Preserve React 18 support metadata
- Update README and migration guides for `2.0.0-beta.1` release, highlighting breaking changes and installation instructions with `@beta` tag
- Update migration guides and API documentation for `2.0.0-beta.1`, clarifying breaking changes and enhancing MDX component integration
- Normalize README spacing
- Document Shadow DOM themeRoot and align 2.0 public API copy

### Miscellaneous

- Add project agent skills for React and Next work
- _(themes)_ Test TypeScript 5.9 through 7
- Verify library and docs independently
- Align release and support gates
- Align final stack tooling state
- Refresh split train lockfile
- Exclude .agents dir from Linguist
- Update package manager to bun@1.3.9 and add install command in vercel.json
- Update build command in vercel.json to use bunx for consistency
- _(tooling)_ Replace Biome with Oxc lint and format
- _(tooling)_ Bump oxfmt and oxlint to latest
- _(tooling)_ Switch package management from Bun to pnpm
- _(ci)_ Group Dependabot updates into fewer PRs
- _(themes)_ Generate extended bootstrap source
- _(ci)_ Stop triple-building the library and finish pnpm leftover drift

### Other

- Address PR review feedback (#37)
- Address PR review feedback (#38)

## [1.2.0] - 2026-08-10

### Added

- _(themes)_ Isolate typed factory contexts
- _(themes)_ Tighten public TypeScript contracts
- _(themes)_ Adopt useEffectEvent with React 18 fallback

## [1.1.0] - 2026-08-03

### Added

- _(themes)_ Add a stable framework-neutral bootstrap
- _(themes)_ Expose portable client APIs

### Fixed

- _(themes)_ Harden runtime theme synchronization
- _(themes)_ Validate stored selections consistently
- _(themes)_ Keep default provider lightweight
- _(themes)_ Forward storage errors in Next provider
- _(themes)_ Resolve package imports during type-check
- _(themes)_ Keep next-provider bootstrap within size budget
- _(themes)_ Address portable SSR review feedback
- _(themes)_ Honor enableSystem when resolving system theme

### Performance

- _(themes)_ Use set lookups and register benchmark fixtures

### Documentation

- _(themes)_ Document portable APIs

### Miscellaneous

- Drop unused @biomejs/cli-linux-x64 dev dependency

## [1.0.0] - 2026-07-04

### Added

- _(publish)_ Enhance NPM publishing logic for prereleases and stable releases

### Fixed

- _(theme)_ Enable TypeScript declaration file splitting in bunup.config.ts
- _(theme)_ Update size comparison script to use baseline benchmarks
- _(theme)_ Enhance cookie handling and class attribute management
- _(theme)_ Add entry points for TypeScript declaration file generation in bunup.config.ts

### Changed

- Split client provider DOM helpers
- _(themes)_ Make root entry client-only and remove duplicate provider

### Miscellaneous

- Update package dependencies and refine theme package structure

## [0.9.7] - 2026-06-30

### Added

- _(theme)_ Enhance bundle size management and comparison
- _(animation)_ Improve motion handling with reduced motion support
- _(config)_ Add support for next-themes compatibility and enhance webpack configuration
- _(layout)_ Integrate ThemeProvider for enhanced theme management and update metadata
- _(docs)_ Add Vercel configuration and update build script for documentation

### Fixed

- _(hero-content)_ Adjust layout and typography for improved responsiveness and visual consistency
- _(docs)_ Resolve react-doctor warnings
- _(layout)_ Update ThemeProvider import path for compatibility with next.js
- _(build)_ Add next-provider as explicit bunup entry to prevent 'use client' chunk contamination
- _(docs)_ Remove next-themes alias causing SSR prerender crash on Vercel
- _(theme)_ Improve cookie handling and validation, enhance script safety
- _(theme)_ Update baseline sizes and improve cookie handling logic
- _(theme)_ Remove unused client-next-provider entry and update baseline sizes
- _(theme)_ Preserve Next server entrypoint boundary

### Changed

- _(docs)_ Remove old Vercel configuration and add new build script for documentation
- _(layout)_ Remove ThemeProvider

### Documentation

- Update comparison and features sections for clarity and accuracy
- _(theme)_ Add security notes and model to ThemeProvider documentation

### Other

- Revert 47d4e02b65fefcfdbc162c95a4c9cb47f7205952

## [0.9.6] - 2026-06-29

### Added

- _(theme)_ Enhance theme type definitions and improve theme selection logic
- _(theme)_ Enhance theme management with typed themes and improved documentation
- _(theme)_ Add new types for theme configuration and value mapping

### Documentation

- _(theme)_ Update README with new badge styles
- _(theme)_ Update documentation for typed themes and hybrid storage

## [0.9.4] - 2026-05-21

### Fixed

- _(readme->docs)_ Fixed fields values in API reference

### Changed

- _(theme)_ Improve transition suppression logic and update documentation

## [0.9.2] - 2026-05-07

### Added

- _(themes)_ Introduce fine-grained client subpath exports and update documentation

## [0.9.1] - 2026-05-07

### Added

- _(github->dx)_ Added configuration of Dependabot
- _(github->funding)_ Added funding file
- _(themes)_ Add bundle size benchmarks
- _(themes)_ Add followSystem option to theme configuration and update related tests
- _(themes)_ Enhance cookie serialization with validation for names, paths, and domains

### Documentation

- Update README.md to include badge links for npm version and documentation

## [0.9.0] - 2026-04-23

### Added

- _(themes)_ Add hybrid storage runtime support
- _(themes)_ Introduce createThemes factory and useThemeEffect hook, along with corresponding tests

### Fixed

- _(themes)_ Rely on document.defaultView for DOM listeners

### Changed

- _(themes)_ Improve regex usage in cookie handling and add lint ignore comments for test helpers and image component

### Documentation

- Update documentation for v0.9.0 features including hybrid storage, createThemes factory, and useThemeEffect hook

### Miscellaneous

- _(ci)_ Update bun version to 1.3.9 in CI workflow
- _(ci)_ Update lint command in CI workflow to use biome check

## [0.8.3] - 2026-04-10

### Fixed

- Prevent duplicate script insertion in ClientNextThemeProvider by using a ref to track insertion state; closes #13

## [0.8.2] - 2026-04-08

### Fixed

- Exclude system from resolvedTheme type in ThemeContextValue for improved type safety; fixes #11

## [0.8.1] - 2026-04-07

### Added

- Add CookieOptions type to enhance cookie management in theme provider
- Implement cookie management functions and enhance ClientThemeProvider with cookieOptions support
- Add cookieOptions section to theme provider documentation for enhanced cookie management

### Fixed

- Forward cookieOptions through ThemeProvider wrappers

### Changed

- Update SVG dimensions and styles, replace apple-icon and favicon images, and adjust footer and layout image sizes for consistency

### Documentation

- Update theme provider documentation with improved code examples and formatting for clarity

## [0.7.9] - 2026-03-29

### Fixed

- Validate "system" as a valid stored theme value (refs #7)

## [0.7.8] - 2026-03-28

### Fixed

- Dynamically import cookies from next/headers to ensure compatibility with server-side rendering; closes #5

## [0.7.7] - 2026-03-25

### Miscellaneous

- Update bun.lock and publish.yml for dependency version upgrades and specific Bun version

### Other

- Add Contributor Covenant Code of Conduct

## [0.7.6] - 2026-03-25

### Added

- Add motion dependency and enhance UI components with improved styling and accessibility
- Refactor Hero component by extracting HeroContent for improved readability and maintainability
- Enhance UI components with motion effects for improved user experience and visual appeal

### Documentation

- Update footer links to point to specific API and Examples pages for better navigation

### Miscellaneous

- Add sideEffects flag to package.json for better tree-shaking optimization; closes #2

## [0.7.5] - 2026-03-22

### Fixed

- Remove node:module from client chunk (bunup target browser)

### Documentation

- Add 'always follow system preference' feature to documentation and comparison table for @wrksz/themes

## [0.7.4] - 2026-03-22

### Added

- Add disableTransitionOnChange feature to themeScript and related tests

### Documentation

- Add migration guide for transitioning from next-themes to @wrksz/themes
- Clarify disableTransitionOnChange functionality in ThemeProvider documentation

## [0.7.3] - 2026-03-22

### Added

- Implement getTheme function for cookie-based theme management and export related types

### Documentation

- Add documentation for getTheme function, detailing usage in proxy and layouts
- Add versioning information for getTheme function in documentation
- Enhance README with migration notes, comparison table, and updated usage instructions for @wrksz/themes
- Update documentation to include new features for @wrksz/themes, such as per-property transition disabling and reading theme outside React
- Update versioning information for getTheme and ThemeProvider to 0.7.3

### Miscellaneous

- Add GitHub release configuration and update publish workflow to include testing and release notes generation

## [0.7.2] - 2026-03-22

### Fixed

- Escape special characters in regex for cookie storage retrieval in theme management (developer-controlled prop)

### Documentation

- Add note about flash in Next.js development mode to server-theme documentation
- Update ThemeProvider usage instructions to clarify async component requirements and provide examples for correct implementation
- Clarify onThemeChange prop behavior in ThemeProvider documentation and type definitions
- Update ThemeProvider documentation to clarify disableTransitionOnChange prop functionality and provide usage examples
- Add guidance on avoiding @media (prefers-color-scheme) in CSS for custom themes to prevent flash of unstyled content
- Update ThemeProvider documentation to reflect changes in disableTransitionOnChange prop versioning

## [0.7.1] - 2026-03-22

### Added

- Add bunup configuration for theme package and simplify build scripts

## [0.7.0] - 2026-03-22

### Added

- Add NotFound component and refactor Hero component to use new Button component
- Add apple icon and favicon for improved branding
- Update metadataBase URL in layout for improved theme documentation
- Implement custom OGImage component for dynamic Open Graph images in documentation
- Enhance Hero component to display GitHub stars and update repository link dynamically
- Enhance theme management with cookie storage and add ClientNextThemeProvider component
- Update ClientThemeProvider and ThemeProvider to support cookie storage for theme management

### Documentation

- Add README.md for themes package and update banner image URL
- Add descriptions to API and Examples metadata for clarity
- Update README.md to clarify import path for ThemeProvider and enhance description of themes package
- Enhance theme documentation with details on cookie storage support and zero-flash SSR implementation

### Other

- Install Vercel Web Analytics

## [0.6.1] - 2026-03-22

### Fixed

- Update build script to set NODE_ENV to production for optimized builds

## [0.6.0] - 2026-03-22

### Added

- Add Next.js support and enhance theme management with new provider structure

### Documentation

- Update documentation to reflect new import paths and clarify theme management features in Next.js

## [0.5.0] - 2026-03-21

### Changed

- Update theme imports to use new client module structure

### Documentation

- Update layout metadata to improve description and add new keywords for enhanced theme management features

## [0.4.1] - 2026-03-21

### Added

- Migrate docs
- Enhance mobile and desktop views in Comparison component with responsive labels
- Implement responsive labels for Yes, No, Fixed, and Bug components in mdx.tsx

### Changed

- Move to packages/themes

### Miscellaneous

- Update workflows to set working directory for themes and restrict paths for CI triggers

## [0.4.0] - 2026-03-21

### Added

- Update bug report template and add new framework support request template for enhanced issue tracking
- Add @testing-library/react as a devDependency for improved testing capabilities
- Add ThemedImage component for theme-aware image rendering and update README with usage examples
- Export useThemeValue hook and ThemedImageProps type for enhanced theming capabilities

### Fixed

- Update theme initialization logic to ignore stored value when followSystem is true and add corresponding tests
- Enhance storage event handling to ignore events from sessionStorage and add corresponding test case

### Documentation

- Add section on scoped theming to README with examples for applying different themes per section
- Add useThemeValue hook documentation to README and implement the hook for theme-based value retrieval
- Clarify README entries for followSystem and nonce props in ThemeToggle component

## [0.3.1] - 2026-03-21

### Added

- Update class handling in themeScript and ClientThemeProvider to support multiple space-separated classes
- Introduce initialTheme prop for server-side theme initialization and update README with usage examples
- Add issue templates for bug reports and feature requests to improve issue tracking

### Documentation

- Add section on using ClientThemeProvider for nested providers in Client Components to README

## [0.3.0] - 2026-03-21

### Added

- Add testing framework setup and implement theme script tests for comprehensive theme management validation
- Add followSystem prop to ThemeProvider and ClientThemeProvider for enhanced theme preference management
- Enhance ClientThemeProvider to re-apply theme on bfcache restore and history navigation
- Per-instance store with useSyncExternalStore, fix nested providers and SSR isolation

### Miscellaneous

- Add missing plus after React 19
- Add happy-dom and related types to dependencies, and include test script in package.json

## [0.2.1] - 2026-03-21

### Added

- Add themeColors support to ScriptConfig and themeScript for dynamic meta theme-color management
- Pass themeColor prop to ThemeProvider for improved theme customization
- Implement themeStore for centralized theme state management and update ClientThemeProvider to utilize it

### Documentation

- Update README with comprehensive usage instructions and examples for @wrksz/themes, including setup, API details, and theme customization options

## [0.2.0] - 2026-03-21

### Added

- Implement theme management script with configuration and serialization functionality
- Add color scheme support and forced theme option in theme management script
- Add type exports for theme-related components in index file
- Create ThemeContext and useTheme hook for theme management
- Implement ClientThemeProvider and ThemeProvider for enhanced theme management

### Fixed

- Remove unnecessary registry-url from node setup in publish workflow
- Correct comment formatting in ThemeContextValue type definition (AI-generated docs 😳)
- Update npm publish workflow to include registry URL and provenance flag
- Add repository url to package.json

### Changed

- Remove unused button component and associated styles, add theme-related types

### Miscellaneous

- Update package version to 0.0.0 and enhance publish workflow with version setting script

## [0.1.1] - 2026-03-21

### Fixed

- Enhance publish workflow by adding node setup and updating npm publish command

## [0.1.0] - 2026-03-21

### Added

- Project initialization
- Add biome configuration and integrate linter/formatter with lefthook support
- Add CI and publish workflows for automated linting, type-checking, and npm publishing

### Fixed

- Update build command in CI and publish workflows to use 'bun run build'
- Update prepare script to conditionally install lefthook based on CI environment
- Update npm publish step to include authentication token configuration

### Other

- Initial commit

[unreleased]: https://github.com/jakubwarkusz/themes/compare/v1.2.0..HEAD
[1.2.0]: https://github.com/jakubwarkusz/themes/compare/v1.1.0..v1.2.0
[1.1.0]: https://github.com/jakubwarkusz/themes/compare/v1.0.0..v1.1.0
[1.0.0]: https://github.com/jakubwarkusz/themes/compare/v0.9.7..v1.0.0
[0.9.7]: https://github.com/jakubwarkusz/themes/compare/v0.9.6..v0.9.7
[0.9.6]: https://github.com/jakubwarkusz/themes/compare/v0.9.5..v0.9.6
[0.9.4]: https://github.com/jakubwarkusz/themes/compare/v0.9.2..v0.9.4
[0.9.2]: https://github.com/jakubwarkusz/themes/compare/v0.9.1..v0.9.2
[0.9.1]: https://github.com/jakubwarkusz/themes/compare/v0.9.0..v0.9.1
[0.9.0]: https://github.com/jakubwarkusz/themes/compare/v0.8.3..v0.9.0
[0.8.3]: https://github.com/jakubwarkusz/themes/compare/v0.8.2..v0.8.3
[0.8.2]: https://github.com/jakubwarkusz/themes/compare/v0.8.1..v0.8.2
[0.8.1]: https://github.com/jakubwarkusz/themes/compare/v0.7.9..v0.8.1
[0.7.9]: https://github.com/jakubwarkusz/themes/compare/v0.7.8..v0.7.9
[0.7.8]: https://github.com/jakubwarkusz/themes/compare/v0.7.7..v0.7.8
[0.7.7]: https://github.com/jakubwarkusz/themes/compare/v0.7.6..v0.7.7
[0.7.6]: https://github.com/jakubwarkusz/themes/compare/v0.7.5..v0.7.6
[0.7.5]: https://github.com/jakubwarkusz/themes/compare/v0.7.4..v0.7.5
[0.7.4]: https://github.com/jakubwarkusz/themes/compare/v0.7.3..v0.7.4
[0.7.3]: https://github.com/jakubwarkusz/themes/compare/v0.7.2..v0.7.3
[0.7.2]: https://github.com/jakubwarkusz/themes/compare/v0.7.1..v0.7.2
[0.7.1]: https://github.com/jakubwarkusz/themes/compare/v0.7.0..v0.7.1
[0.7.0]: https://github.com/jakubwarkusz/themes/compare/v0.6.1..v0.7.0
[0.6.1]: https://github.com/jakubwarkusz/themes/compare/v0.6.0..v0.6.1
[0.6.0]: https://github.com/jakubwarkusz/themes/compare/v0.5.0..v0.6.0
[0.5.0]: https://github.com/jakubwarkusz/themes/compare/v0.4.1..v0.5.0
[0.4.1]: https://github.com/jakubwarkusz/themes/compare/v0.4.0..v0.4.1
[0.4.0]: https://github.com/jakubwarkusz/themes/compare/v0.3.1..v0.4.0
[0.3.1]: https://github.com/jakubwarkusz/themes/compare/v0.3.0..v0.3.1
[0.3.0]: https://github.com/jakubwarkusz/themes/compare/v0.2.1..v0.3.0
[0.2.1]: https://github.com/jakubwarkusz/themes/compare/v0.2.0..v0.2.1
[0.2.0]: https://github.com/jakubwarkusz/themes/compare/v0.1.1..v0.2.0
[0.1.1]: https://github.com/jakubwarkusz/themes/compare/v0.1.0..v0.1.1
[0.1.0]: https://github.com/jakubwarkusz/themes/tree/v0.1.0

<!-- generated by git-cliff -->
