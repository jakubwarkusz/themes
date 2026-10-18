# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-10-18

### Added

- *(components)* Add AI logos and integrate them into page actions ([8898ae5](https://github.com/jakubwarkusz/themes/commit/8898ae5ecfc1bace20d042ac32588ea4a5293833))
- *(changelog)* Implement getChangelogMarkdown function and update LLM text retrieval ([f1f0d0d](https://github.com/jakubwarkusz/themes/commit/f1f0d0df1cd4f512a424cbf075497eb9aa3500d1))

### Fixed

- *(themes)* Restore theme before paint when an Activity root layout is revealed ([bfa0977](https://github.com/jakubwarkusz/themes/commit/bfa0977fe1ab44a8095d0621523eeaa822d15659))

### Performance

- *(themes)* Update benchmark sizes for various providers ([5a03301](https://github.com/jakubwarkusz/themes/commit/5a0330150217e8bc0fba706ca8322928ab6b75cb))
- *(themes)* Update bundle size thresholds for various providers ([84afacd](https://github.com/jakubwarkusz/themes/commit/84afacd7458b9deb577cc0d2c4f6b21d57c5e1e1))

### Miscellaneous

- Enhance changelog functionality and update formatting ([5e92e54](https://github.com/jakubwarkusz/themes/commit/5e92e54f0cfb037bccc9c00067652c5499dfe1dc))

## [2.1.0] - 2026-10-18

### Added

- Add support for bun package manager and enhance layout in hero content ([a3fd598](https://github.com/jakubwarkusz/themes/commit/a3fd59874c7ba212f8479b5b8db37368eb3cb5cb))
- Integrate Google Fonts into OG image generation for improved typography ([e15f8f1](https://github.com/jakubwarkusz/themes/commit/e15f8f130bfafa0bea790cb4d9c9b947db3db03a))
- Add @pierre/theme and shiki for enhanced theming and syntax highlighting; update layout and global styles ([ff3c817](https://github.com/jakubwarkusz/themes/commit/ff3c81758f6ade8731273987f1b962dd892de434))
- Implement callout component with customizable tones and styles; enhance badge components for improved visual feedback ([bed3da2](https://github.com/jakubwarkusz/themes/commit/bed3da2ec7f8ef317ff18ed541314e55f81fcbfe))
- Enhance documentation styling and functionality; add ScrollFade component for improved table presentation ([baa0f82](https://github.com/jakubwarkusz/themes/commit/baa0f822e389cb31bb2348cdcfec9e78a9b4a9a6))
- Enhance documentation with Do and Dont components for best practices; update theme-provider and tailwind examples for clarity ([eaebf73](https://github.com/jakubwarkusz/themes/commit/eaebf73fb64b7bd61e478de80b42380b7eaa7e78))
- Replace package manager installation tabs with InstallCommand component for streamlined documentation; refactor global styles and enhance button transitions ([3c2b104](https://github.com/jakubwarkusz/themes/commit/3c2b1044683d5c5bd7b368ff56695b5844d08d4a))
- Enhance InstallCommand component with localStorage support for package manager selection; implement subscription mechanism for state updates ([0a15b8a](https://github.com/jakubwarkusz/themes/commit/0a15b8aa80b44082c2f3870148c6af7b4a2df180))
- Implement ThemeSwitch component for dynamic theme toggling; update layout to integrate theme provider with disabled state ([37e3808](https://github.com/jakubwarkusz/themes/commit/37e380859dfe17dc7322f1939240e6886685d168))
- Add ThemeDemo component for showcasing theme variations; enhance global styles and integrate PageActions for improved documentation interactivity ([51ec6c2](https://github.com/jakubwarkusz/themes/commit/51ec6c2ad8c84a78e46fbb11ff2b5b6372aa567b))
- Add demo-avatar styling and avatarVars function for dynamic avatar generation; enhance theme-demo component with improved visual representation ([9c6e8d1](https://github.com/jakubwarkusz/themes/commit/9c6e8d12f8a9d507ff329d98fc48d5ceb7dbd0fa))
- Integrate Table of Contents (TOC) functionality with active heading tracking and section progress; enhance documentation layout with new TOC components for improved navigation ([4a0d10c](https://github.com/jakubwarkusz/themes/commit/4a0d10cbe719718b66c86f4a4154652d7645bb49))
- Implement search dialog component with enhanced styling and animations; integrate scroll fade functionality for improved user experience in documentation search ([b8c3796](https://github.com/jakubwarkusz/themes/commit/b8c3796367f07a947d9711bcefc2d7b0addfd6e4))
- Add PageFooter component for enhanced navigation and editing capabilities in documentation; integrate previous and next page links along with last modified date display ([f0968fb](https://github.com/jakubwarkusz/themes/commit/f0968fbbaa4ceb482a518b55353de6f7c28d67db))
- Enhance CodeBlock component with collapsible functionality for long code snippets; integrate line counting for improved user experience in documentation ([55560ba](https://github.com/jakubwarkusz/themes/commit/55560ba6cae5d95a269875f1b90c7e28ef0a327d))
- Update global styles to include new font weight and enhance typography; modify route file to load custom font from local assets for improved performance ([3d499e4](https://github.com/jakubwarkusz/themes/commit/3d499e4ff24dd92ba431c4f8aad9d2fd5a7d58e2))
- Add Heading component for enhanced section navigation with copy link functionality; integrate into MDX components for improved documentation structure ([c5bbf85](https://github.com/jakubwarkusz/themes/commit/c5bbf853600155902de0a38bcf1fc368a2a71308))
- Update sidebar components with improved styling and functionality; enhance global styles and meta.json for better documentation organization ([cf4cd93](https://github.com/jakubwarkusz/themes/commit/cf4cd937cef27a7183b96b0770990af82b0295d5))
- Refine sidebar button styles for improved aesthetics and hover effects; update layout component for better version display ([80079bc](https://github.com/jakubwarkusz/themes/commit/80079bc4340cc3dd93c0940f3b89d54bf3c13085))
- Enhance ThemeSwitch component with improved animations and styling; update global styles for better theme toggle visibility and accessibility ([33e5a5e](https://github.com/jakubwarkusz/themes/commit/33e5a5eff316c15c67529e68f499ba598b494479))
- Implement HomeHeader component for improved navigation and branding; integrate NavTitle for dynamic version display in layout ([8590830](https://github.com/jakubwarkusz/themes/commit/85908309ff313d7492776cd37e7fc50a5a61fede))
- Enhance theme demo component with improved layout and animations; update global styles to include new demo surface colors for better theme representation ([8d855b5](https://github.com/jakubwarkusz/themes/commit/8d855b51570dce7e8fc5a2197f2379474913ab64))
- Update HeroContent and Hero components with improved layout and animations; adjust transition durations and refine styling for better responsiveness ([3036547](https://github.com/jakubwarkusz/themes/commit/303654725295870736e4ed2089cccd6ea29ec9b1))
- Enhance ThemeDemo and CodeBlock components with collapsible code functionality; update theme preview implementation and global styles for improved theme representation ([c3ef297](https://github.com/jakubwarkusz/themes/commit/c3ef297539504981a350f06adf5af9ec1eea1aa7))
- Update FeaturesGrid component with improved layout and animations; refine item presentation and transition effects for better user experience ([ef256ba](https://github.com/jakubwarkusz/themes/commit/ef256ba11605fe4f1b8950605863a1be0f734305))
- Enhance Comparison component with updated layout and animations; adjust transition effects and styling for improved user experience ([b962765](https://github.com/jakubwarkusz/themes/commit/b962765a10807185b9f0f27e90cdebd64928556b))
- Update Roadmap component with refined layout and animations; adjust transition effects and styling for improved presentation and user experience ([6545397](https://github.com/jakubwarkusz/themes/commit/65453977e44ed0d9fbfab0e206319f17812a1d59))
- Add FooterSearch component for enhanced search functionality in footer; update footer layout and styles for improved user experience ([d7b0ce2](https://github.com/jakubwarkusz/themes/commit/d7b0ce213bf183bc5499ec8ccaa7b033bfca44be))
- Enhance documentation with new examples for data attributes, forced themes, hybrid storage, meta theme color, scoped theming, and Tailwind CSS integration; add demo components for better user interaction ([e1615a6](https://github.com/jakubwarkusz/themes/commit/e1615a623769186b061b1b88517ba73e4a01a563))
- Replace InstallCommand with HeroInstall component in HeroContent; introduce HeroInstall for improved package manager selection and command display ([57f2dde](https://github.com/jakubwarkusz/themes/commit/57f2dde7045af40f05435eb68f5d47f5ba35de58))
- Add new icon and manifest files for improved application branding; update existing apple and favicon images ([4c5ec50](https://github.com/jakubwarkusz/themes/commit/4c5ec50b36b39a7e3d627b809f265d17c6e14220))
- Redesign NotFound page with new layout and imagery; add OpenGraph image generation for enhanced social sharing ([8071fe3](https://github.com/jakubwarkusz/themes/commit/8071fe38369741a9823316a2a670a7fff7f172fe))
- Add changelog component and page to document release history; integrate changelog data retrieval and display in the documentation ([bcad6d6](https://github.com/jakubwarkusz/themes/commit/bcad6d65ecae29c6f7d03dcbd5b6a20a86137df2))
- Enhance changelog functionality by integrating structured data retrieval and improving release entry display with icons; update older releases component for better navigation ([e301ea0](https://github.com/jakubwarkusz/themes/commit/e301ea0725064d2f943ea1c1ed209b31829b8a50))
- Enhance documentation and layout components by integrating version display and improving navigation; add changelog links and update layout structure for better user experience ([2fab046](https://github.com/jakubwarkusz/themes/commit/2fab0467bbdfaaae4d25a72d0b550a3a0599e604))
- Add Sponsors component to HomePage and create HoxgerLogo for branding; enhance layout with dynamic imports for improved user engagement ([765ca47](https://github.com/jakubwarkusz/themes/commit/765ca4767478a92bbad45a16daab6c21c34c160b))
- Enhance TOC functionality by integrating TocPopover for improved navigation and user interaction; update imports and slot configurations for better component structure ([5e22204](https://github.com/jakubwarkusz/themes/commit/5e222045d20125be134d7931a727a78253b1c6ca))
- Implement page feedback component for user interaction and enhance layout with sidebar sponsor; add animation for feedback display and integrate feedback functionality in page footer ([f3599fa](https://github.com/jakubwarkusz/themes/commit/f3599fa48fd7062ab932c16eaa856265fde7039d))
- Introduce configurator component for dynamic theme and storage configuration; enhance documentation with configurator page and tests for improved user experience ([a864938](https://github.com/jakubwarkusz/themes/commit/a8649381628217172e9de6dedd304998ba075c3c))
- Enhance Hero component to display weekly downloads alongside GitHub stars; update layout and formatting for improved user experience ([7b613e2](https://github.com/jakubwarkusz/themes/commit/7b613e2bcad97c4818db6f561f0daa4012bbdc0c))
- Add new benchmark fixtures and update bundle size thresholds for client and factory components; enhance documentation for clarity ([f91f940](https://github.com/jakubwarkusz/themes/commit/f91f940d9b133c6ca2ad188fe103c359899b7792))
- Refactor ThemeProvider and ClientNextThemeProvider to utilize script configuration for improved theme management; update benchmarks and tests for enhanced performance and reliability ([6aed1a2](https://github.com/jakubwarkusz/themes/commit/6aed1a26e726544d8029f97b0607bed886596b67))

### Fixed

- Update button components to prevent default cursor behavior; enhance accessibility and user experience across various buttons ([98a29dc](https://github.com/jakubwarkusz/themes/commit/98a29dc1b2527f3795f637aae9a42b98e3ccbf87))
- Remove unnecessary margin from GitHub icon button in HomeHeader component for cleaner layout ([dbee3bb](https://github.com/jakubwarkusz/themes/commit/dbee3bb8bf7b0dd3c0c2fa36021e883559db5311))
- Update maxDeltaGzipBytes in bundle-size-thresholds.json to improve performance metrics ([d2657af](https://github.com/jakubwarkusz/themes/commit/d2657af6f478cd4a4f4cb142fdcb061066c89b9d))
- Update TocRail component styles to improve text wrapping and presentation ([86eedb6](https://github.com/jakubwarkusz/themes/commit/86eedb6c487b9aafd271650c0f9bd85880f25f93))
- Update HeroContent styles for improved accessibility and visual consistency; enhance star display with better layout and hover effects ([adfcd36](https://github.com/jakubwarkusz/themes/commit/adfcd36a422e8ee92924d703667238c62abb3af6))
- Adjust marginBottom style in TocGuides component for consistent spacing based on level comparison ([6345be2](https://github.com/jakubwarkusz/themes/commit/6345be26b655d3f1331f74c52592825b3d80ffc7))
- Update overflow style in OlderReleases component from 'overflow-hidden' to 'overflow-clip' for improved content visibility ([5e27280](https://github.com/jakubwarkusz/themes/commit/5e27280cf8463a3abf9db0ca44af6590aba08df3))
- Update grid layout in Configurator component for improved responsiveness and alignment ([7e3c64d](https://github.com/jakubwarkusz/themes/commit/7e3c64dcc5ea8e96c6a8058c64e47beb24d19241))
- Adjust margin and padding styles in Configurator component for improved layout consistency ([9ae29d0](https://github.com/jakubwarkusz/themes/commit/9ae29d0187120770d22c00a62f6419d442794d04))
- Update GitHub icon import in HeroContent component for consistency ([1290048](https://github.com/jakubwarkusz/themes/commit/1290048b05824bebfff07ee623e5e69611472d5b))

### Performance

- *(themes)* Reduce observer work and reuse transition styles ([f1f33c1](https://github.com/jakubwarkusz/themes/commit/f1f33c18e21509d267d2161337a5d4df2e7fd4bb))
- *(themes)* Shrink declarations and published package metadata ([5293210](https://github.com/jakubwarkusz/themes/commit/5293210600a3120c53ca9d99490ecf39179211a5))
- *(themes)* Streamline transition styles and align bundle budgets ([134f645](https://github.com/jakubwarkusz/themes/commit/134f64598017e1bf60de45c3f9a014903db638a1))

### Changed

- Simplify InstallSnippet component layout and update icon usage for improved clarity and accessibility ([2bebe08](https://github.com/jakubwarkusz/themes/commit/2bebe0894aeaa150139510623430cbb7594fc1b9))
- Update README to include responsive image support and improve theme comparison table; add new dark and light banner images ([d40e8f9](https://github.com/jakubwarkusz/themes/commit/d40e8f957fab1a5989f8117896acddce2b09e2c0))

### Miscellaneous

- Update README badges to use SVG format for better scalability and visual consistency; add new badges for npm, docs, Next.js, React, and TypeScript ([fc958a8](https://github.com/jakubwarkusz/themes/commit/fc958a8a55a399cfaa7564a282ed26ff38ff3254))
- Update CHANGELOG formatting and improve regex for release entries in changelog parser ([d8477fd](https://github.com/jakubwarkusz/themes/commit/d8477fd3bce3d16940669af1831b842859cc0c09))

## [2.0.4] - 2026-10-18

### Added

- Enhance home page with new images and animations ([3fb0c8c](https://github.com/jakubwarkusz/themes/commit/3fb0c8c1abed9138978c2b9a5c4eb4d3eda6ec54))

### Fixed

- Update bundle size thresholds for client-provider to improve performance; fixes #123 ([caa4c6e](https://github.com/jakubwarkusz/themes/commit/caa4c6ea9af386291eb8d0560fd99988fbed0b57))

### Documentation

- Update README.md with new images and sponsorship details ([ec3d26e](https://github.com/jakubwarkusz/themes/commit/ec3d26ed24be65ef1446e2ed9df3dbc7772cf956))
- Add AGENTS.md and CLAUDE.md for Next.js agent rules documentation ([b56c5de](https://github.com/jakubwarkusz/themes/commit/b56c5de33c1dface4cbb76f5a7eb75e9c40b2b7d))

### Miscellaneous

- Update banner and social preview images ([c2f0cf6](https://github.com/jakubwarkusz/themes/commit/c2f0cf68c7325de3633a40a8b8116e097bbdf543))

## [2.0.3] - 2026-10-03

### Fixed

- Use Node-compatible Next.js imports (closes #116) ([b29d7cc](https://github.com/jakubwarkusz/themes/commit/b29d7ccc2d4d8787d97201e9251456f1f7a44bcd))

### Documentation

- Include current unreleased history in CHANGELOG.md by [@martijn00](https://github.com/martijn00) ([22c38ca](https://github.com/jakubwarkusz/themes/commit/22c38cae46fe9b4ef5f1b763081e9be845e01604))
- Refresh CHANGELOG.md through the v2.0.2 tag by [@martijn00](https://github.com/martijn00) ([d4de044](https://github.com/jakubwarkusz/themes/commit/d4de0442215624915e9c736c2b7b4e4b52e124dd))

## [2.0.2] - 2026-09-20

### Documentation

- Update documentation to reflect changes in versioning and installation instructions for @wrksz/themes ([0ff5291](https://github.com/jakubwarkusz/themes/commit/0ff5291ae2e883d82baf3b96638bfd83f1a71ea9))
- Update README and package documentation for clarity on theme management features and migration instructions ([3f21167](https://github.com/jakubwarkusz/themes/commit/3f2116750e4b7a71fb33d0ee62ce8f59810d3e96))
- Add AI agents section and integration guide to enhance user support and migration clarity ([20be57f](https://github.com/jakubwarkusz/themes/commit/20be57f22330a9ed28370e260a68efe9217da2ca))

## [2.0.1] - 2026-09-20

### Added

- Enable minification in tsdown configuration for optimized builds ([799ce36](https://github.com/jakubwarkusz/themes/commit/799ce36d3f2c40557ada1636ee2502a1fa6fdbc6))

### Performance

- Reduce theme reapplication work and enforce package size budget ([10469d1](https://github.com/jakubwarkusz/themes/commit/10469d168e1b94843ce7cbb51efc09c0c919d905))

## [2.0.0] - 2026-09-20

### Added

- *(themes)* Add opt-in extended providers by [@martijn00](https://github.com/martijn00) ([859c670](https://github.com/jakubwarkusz/themes/commit/859c670f8b6444aa600b60cd6eb149196c3eb8bc))
- *(themes)* Pair createThemes with NextThemeProvider and ThemeScript by [@martijn00](https://github.com/martijn00) ([48684af](https://github.com/jakubwarkusz/themes/commit/48684af9e1f8d70e4f575e3b4f4d948418a3b072))

### Fixed

- *(next)* Keep theme provider in app shells by [@martijn00](https://github.com/martijn00) ([555cfe6](https://github.com/jakubwarkusz/themes/commit/555cfe67b94d1e740fc83cf2ec91d311d94ff5a2))
- *(next)* Add metadata for tenant pages by [@martijn00](https://github.com/martijn00) ([b83b62e](https://github.com/jakubwarkusz/themes/commit/b83b62e7e3811a99133a62318c21ad47df58edcf))
- *(themes)* Stabilize provider initialization and bootstrap parity by [@martijn00](https://github.com/martijn00) ([623a1c7](https://github.com/jakubwarkusz/themes/commit/623a1c7516f89d5f6730f5eda191b5400b63267d))
- *(docs)* Trim unused theme exports and use dvh height by [@martijn00](https://github.com/martijn00) ([89af1ca](https://github.com/jakubwarkusz/themes/commit/89af1cae06001949cf3bceb4625644647cb07aaf))
- *(ci)* Clear audit advisories and build library before docs tests by [@martijn00](https://github.com/martijn00) ([d6a9232](https://github.com/jakubwarkusz/themes/commit/d6a923269a8859c2e1aea795422dfa4ad24093b8))
- *(tooling)* Keep generated script-source out of oxfmt by [@martijn00](https://github.com/martijn00) ([4eaf966](https://github.com/jakubwarkusz/themes/commit/4eaf9662a365b602732653329025ca4ddbf27870))
- *(tooling)* Restore library build before docs tests in verify by [@martijn00](https://github.com/martijn00) ([c1a8995](https://github.com/jakubwarkusz/themes/commit/c1a8995ee601133aa9841257d2179a434c1f7d1c))
- *(themes)* Keep setTheme off useEffectEvent for oxlint by [@martijn00](https://github.com/martijn00) ([4f2845b](https://github.com/jakubwarkusz/themes/commit/4f2845bbf2d41a2e826c57428b3d10ad189e4c1d))
- *(themes)* Satisfy exactOptionalPropertyTypes in extended providers by [@martijn00](https://github.com/martijn00) ([a74d5ac](https://github.com/jakubwarkusz/themes/commit/a74d5ac4842ade0bfe9f1e2751035075fdd3b435))
- *(themes)* Adapt extended provider tests after rebase onto main by [@martijn00](https://github.com/martijn00) ([303b8e1](https://github.com/jakubwarkusz/themes/commit/303b8e172b1361d7f52c26d3543891c7c565d562))
- *(themes)* Satisfy oxfmt and oxlint after rebase onto main by [@martijn00](https://github.com/martijn00) ([cdb8fef](https://github.com/jakubwarkusz/themes/commit/cdb8fef44be4197132b1cba45adef58c0a5bcb00))
- *(themes)* Carry merged-PR review feedback into extended providers by [@martijn00](https://github.com/martijn00) ([df166d0](https://github.com/jakubwarkusz/themes/commit/df166d03476d3d096eb100d087f7133ba0962122))
- *(tooling)* Sync pnpm lockfile with oxfmt/oxlint bumps by [@martijn00](https://github.com/martijn00) ([3f952fd](https://github.com/jakubwarkusz/themes/commit/3f952fd9d6290ed1b06b8968abd845ebd9148cfc))
- *(docs)* Keep Vercel on pinned Bun and use pnpm --filter by [@martijn00](https://github.com/martijn00) ([895a406](https://github.com/jakubwarkusz/themes/commit/895a4060b00bac1cf3c76030a0b0c2f73c2523bb))
- *(provider)* Keep the skip/memo pattern inside bundle budgets by [@martijn00](https://github.com/martijn00) ([6b3060a](https://github.com/jakubwarkusz/themes/commit/6b3060a400771392f14454d36fdc6d34f70eb014))
- Unify bootstrap and runtime theme DOM apply by [@martijn00](https://github.com/martijn00) ([b5345d8](https://github.com/jakubwarkusz/themes/commit/b5345d855cab7abc57153449365b412a62c74343))
- Re-apply theme after Instant Navigation restores the DOM by [@martijn00](https://github.com/martijn00) ([84b3b1f](https://github.com/jakubwarkusz/themes/commit/84b3b1ff830c790b2a769d6a7fc3d9fd691db6b1))
- Restore theme when Instant Navigation clears html class by [@martijn00](https://github.com/martijn00) ([67f6f5f](https://github.com/jakubwarkusz/themes/commit/67f6f5fbed7e4d2e7c121a4e82380ca15ffe76cb))
- Observe document replacements during Instant Navigation by [@martijn00](https://github.com/martijn00) ([3a9c352](https://github.com/jakubwarkusz/themes/commit/3a9c352025c25c627832de67efecf589a3cd0912))
- Narrow Instant Navigation observers and keep nested providers subscribed by [@martijn00](https://github.com/martijn00) ([8c95ab1](https://github.com/jakubwarkusz/themes/commit/8c95ab188789ec4f0df5d8093c3843427c17ed6b))
- Keep html theme across Instant Navigation descendant restores by [@martijn00](https://github.com/martijn00) ([ad65e1c](https://github.com/jakubwarkusz/themes/commit/ad65e1cec1f65a6d98d2abd6ce0c81ffcb9ccb42))
- Format getScript slice offsets for oxfmt by [@martijn00](https://github.com/martijn00) ([9a47d7c](https://github.com/jakubwarkusz/themes/commit/9a47d7c3e2fb8c775782a0d10e466e83468db58d))
- Reclaim next-provider gzip under the 3.91 KiB ceiling by [@martijn00](https://github.com/martijn00) ([3e0a53a](https://github.com/jakubwarkusz/themes/commit/3e0a53afa481f9a42b8bdbd4643c960a8f9ecf4a))
- Update documentation for clarity and consistency ([16a6211](https://github.com/jakubwarkusz/themes/commit/16a6211e64a8e2974bb62f45a4e0c85a8da2b55b))
- Keep a single React/Next copy after the workspace bump ([53d6c48](https://github.com/jakubwarkusz/themes/commit/53d6c48f915c6dc042cb763fbf8cbd19e8370702))
- *(docs)* Await fumadocs llms index in the llms.txt route ([850fac3](https://github.com/jakubwarkusz/themes/commit/850fac3d68b47ae593f785621eab08ecc217dfcf))

### Performance

- *(themes)* Reclaim bundle budget headroom without raising limits by [@martijn00](https://github.com/martijn00) ([a653226](https://github.com/jakubwarkusz/themes/commit/a6532261c6d4f1eb9bf2ef2e2a9bbf126bf65325))
- *(docs)* Keep Analytics and below-fold home JS off the critical path by [@martijn00](https://github.com/martijn00) ([b0bfd8b](https://github.com/jakubwarkusz/themes/commit/b0bfd8b0d305c9c5f53f91d9dd484de4a05fc9f9))
- *(provider)* Apply theme once per toggle and keep context identity stable by [@martijn00](https://github.com/martijn00) ([c7e5dd2](https://github.com/jakubwarkusz/themes/commit/c7e5dd206cf630735a17285a2e3598657c6e7ded))
- Omit cookie-parser bytecode from the default inline bootstrap by [@martijn00](https://github.com/martijn00) ([0ef37d2](https://github.com/jakubwarkusz/themes/commit/0ef37d258275f549fc33c58e57fef22f19913055))

### Changed

- Migrate from Bun to Node.js and update testing framework ([d88cfcc](https://github.com/jakubwarkusz/themes/commit/d88cfccf4e682841f36b2dfb2a433332ed168a1e))

### Documentation

- *(themes)* Add upgrading-from-1.x layout example by [@martijn00](https://github.com/martijn00) ([c676a82](https://github.com/jakubwarkusz/themes/commit/c676a825c82e85c2c1e74b22b4855b7074e11b11))
- *(themes)* Call out TypeScript 5.9 peer requirement by [@martijn00](https://github.com/martijn00) ([db9c980](https://github.com/jakubwarkusz/themes/commit/db9c980bf5b3b2c62aa727a810a82408026c091a))
- *(themes)* Document upstream compatibility features by [@martijn00](https://github.com/martijn00) ([cc8731a](https://github.com/jakubwarkusz/themes/commit/cc8731a1f702214adfca873d5bbfa10d90348833))
- *(themes)* Dogfood package in documentation app by [@martijn00](https://github.com/martijn00) ([157907c](https://github.com/jakubwarkusz/themes/commit/157907cac49343d1b3191fdd2ed01d167b24c3ce))
- Add contributor and agent guidance by [@martijn00](https://github.com/martijn00) ([f661027](https://github.com/jakubwarkusz/themes/commit/f661027b9080a5f6286cebdf199983590843faa3))
- Preserve React 18 support metadata by [@martijn00](https://github.com/martijn00) ([92ae3ea](https://github.com/jakubwarkusz/themes/commit/92ae3eaf66330aabf217df784a5ce4760e7e6eb5))
- Update README and migration guides for `2.0.0-beta.1` release, highlighting breaking changes and installation instructions with `@beta` tag ([1908f3a](https://github.com/jakubwarkusz/themes/commit/1908f3aff057f1e7699fbb1a2804743e901a7a61))
- Update migration guides and API documentation for `2.0.0-beta.1`, clarifying breaking changes and enhancing MDX component integration ([6f1e6ad](https://github.com/jakubwarkusz/themes/commit/6f1e6adedc392045d13883bc64e6ab34ec6106bb))
- Normalize README spacing by [@martijn00](https://github.com/martijn00) ([099f2a6](https://github.com/jakubwarkusz/themes/commit/099f2a6cece1cc388b3c2dc9c6353f188ad11264))
- Document Shadow DOM themeRoot and align 2.0 public API copy by [@martijn00](https://github.com/martijn00) ([7de64de](https://github.com/jakubwarkusz/themes/commit/7de64dee09d2c43da216d98bdd9fb539eaa9f323))

### Miscellaneous

- Add project agent skills for React and Next work by [@martijn00](https://github.com/martijn00) ([d5d3bd2](https://github.com/jakubwarkusz/themes/commit/d5d3bd27ac6e4b0f00c6b4e5a7ea488b6d6c6fa0))
- *(themes)* Test TypeScript 5.9 through 7 by [@martijn00](https://github.com/martijn00) ([0269eaf](https://github.com/jakubwarkusz/themes/commit/0269eafb118d774f46b299510b81f8decbad12fe))
- Verify library and docs independently by [@martijn00](https://github.com/martijn00) ([26fb7d4](https://github.com/jakubwarkusz/themes/commit/26fb7d4c65810b09d242c54c66629d0df0a9a4a2))
- Align release and support gates by [@martijn00](https://github.com/martijn00) ([e7fb022](https://github.com/jakubwarkusz/themes/commit/e7fb022dc090b2cfad96e9f4a5fb16120d162557))
- Align final stack tooling state by [@martijn00](https://github.com/martijn00) ([3f2a709](https://github.com/jakubwarkusz/themes/commit/3f2a70977b5e0e2aff9422814efa1f5dd30f82bb))
- Refresh split train lockfile by [@martijn00](https://github.com/martijn00) ([187d488](https://github.com/jakubwarkusz/themes/commit/187d48863ca37187bb8dd7fbe2c5b89737af429b))
- Exclude .agents dir from Linguist ([44350d8](https://github.com/jakubwarkusz/themes/commit/44350d8c0ca17851324313e941bea43ca8001299))
- Update package manager to bun@1.3.9 and add install command in vercel.json ([3e21a2c](https://github.com/jakubwarkusz/themes/commit/3e21a2c1c0d339bded5d539dc633bde6ccb8dbb0))
- Update build command in vercel.json to use bunx for consistency ([4c937bc](https://github.com/jakubwarkusz/themes/commit/4c937bcdd3fb170170533fbe18e5d25890b22e55))
- *(tooling)* Replace Biome with Oxc lint and format by [@martijn00](https://github.com/martijn00) ([2f8e155](https://github.com/jakubwarkusz/themes/commit/2f8e1553fc9cdbdc4d4e9c76816ec259299ebc39))
- *(tooling)* Bump oxfmt and oxlint to latest by [@martijn00](https://github.com/martijn00) ([421083b](https://github.com/jakubwarkusz/themes/commit/421083b7f8ab0e4fdde391a6083e2ea45f8b7ce7))
- *(tooling)* Switch package management from Bun to pnpm by [@martijn00](https://github.com/martijn00) ([df09e3f](https://github.com/jakubwarkusz/themes/commit/df09e3fc6d03c0f6d92f13939612049c7e5b80dd))
- *(ci)* Group Dependabot updates into fewer PRs by [@martijn00](https://github.com/martijn00) ([6211d02](https://github.com/jakubwarkusz/themes/commit/6211d021f7fe91f05cd7e2ca20532ee319c20516))
- *(themes)* Generate extended bootstrap source by [@pttydou](https://github.com/pttydou) ([1ecb992](https://github.com/jakubwarkusz/themes/commit/1ecb9929c5567dc6ecfd44e387660d522c48e37f))
- *(ci)* Stop triple-building the library and finish pnpm leftover drift by [@martijn00](https://github.com/martijn00) ([deee334](https://github.com/jakubwarkusz/themes/commit/deee334cdf39e99c09ffa38b5db0bd0dcc27ee49))

### Other

- Address PR review feedback (#37) by [@martijn00](https://github.com/martijn00) ([9adf140](https://github.com/jakubwarkusz/themes/commit/9adf140328eebc23a210db5a0740ebd9c10556a1))
- Address PR review feedback (#38) by [@martijn00](https://github.com/martijn00) ([bab55c3](https://github.com/jakubwarkusz/themes/commit/bab55c347628dacbf33b1185753a1a23e570f3ba))

## [1.2.0] - 2026-08-10

### Added

- *(themes)* Isolate typed factory contexts by [@martijn00](https://github.com/martijn00) ([739b02a](https://github.com/jakubwarkusz/themes/commit/739b02a7cdbb14a028785c8d0773a8b73a07df2c))
- *(themes)* Tighten public TypeScript contracts by [@martijn00](https://github.com/martijn00) ([88738ad](https://github.com/jakubwarkusz/themes/commit/88738ad6882326d3e90a600028420144ad862a01))
- *(themes)* Adopt useEffectEvent with React 18 fallback by [@martijn00](https://github.com/martijn00) ([28efd5c](https://github.com/jakubwarkusz/themes/commit/28efd5c4ec6b7bb10cda9b5adc4d6476d6d51908))

## [1.1.0] - 2026-08-03

### Added

- *(themes)* Add a stable framework-neutral bootstrap by [@martijn00](https://github.com/martijn00) ([58b9664](https://github.com/jakubwarkusz/themes/commit/58b9664d4cf725d29502dcd82449bc03d77ac6ef))
- *(themes)* Expose portable client APIs by [@martijn00](https://github.com/martijn00) ([39282e5](https://github.com/jakubwarkusz/themes/commit/39282e5118c4fd1aadfe4b3d19edf8574445240b))

### Fixed

- *(themes)* Harden runtime theme synchronization by [@martijn00](https://github.com/martijn00) ([2a97fb6](https://github.com/jakubwarkusz/themes/commit/2a97fb6e74a2e8bf415ac3f5a532a78095b98710))
- *(themes)* Validate stored selections consistently by [@martijn00](https://github.com/martijn00) ([4722c9b](https://github.com/jakubwarkusz/themes/commit/4722c9bed83c6c9d654917e1bc1f4f0d40083bf0))
- *(themes)* Keep default provider lightweight by [@martijn00](https://github.com/martijn00) ([a15ad09](https://github.com/jakubwarkusz/themes/commit/a15ad09b2ee43e412df054e01dbee1449e400f5c))
- *(themes)* Forward storage errors in Next provider by [@martijn00](https://github.com/martijn00) ([3c192c5](https://github.com/jakubwarkusz/themes/commit/3c192c5ef582b279142b19b9e4de5f62f7f2dc0f))
- *(themes)* Resolve package imports during type-check by [@martijn00](https://github.com/martijn00) ([80c316c](https://github.com/jakubwarkusz/themes/commit/80c316c05a3a07ea91864a73ebb0e65414065fd8))
- *(themes)* Keep next-provider bootstrap within size budget by [@martijn00](https://github.com/martijn00) ([6aa95fb](https://github.com/jakubwarkusz/themes/commit/6aa95fb33cc4e868d02fc394dde26379ba07e499))
- *(themes)* Address portable SSR review feedback by [@martijn00](https://github.com/martijn00) ([5d60a44](https://github.com/jakubwarkusz/themes/commit/5d60a446e01522c2fab1e6ab55531a7f3ddec042))
- *(themes)* Honor enableSystem when resolving system theme by [@martijn00](https://github.com/martijn00) ([851e953](https://github.com/jakubwarkusz/themes/commit/851e953a263d6d263495b5a246d6aa3cb9c9abdc))

### Performance

- *(themes)* Use set lookups and register benchmark fixtures by [@martijn00](https://github.com/martijn00) ([bfa524a](https://github.com/jakubwarkusz/themes/commit/bfa524a81f03d5de4f98a0b4feb1bb0fe2c389ca))

### Documentation

- *(themes)* Document portable APIs by [@martijn00](https://github.com/martijn00) ([3cfd6b1](https://github.com/jakubwarkusz/themes/commit/3cfd6b11c7fe311d23de6e28b3a16f7b97bc0645))

### Miscellaneous

- Drop unused @biomejs/cli-linux-x64 dev dependency by [@martijn00](https://github.com/martijn00) ([92b60f2](https://github.com/jakubwarkusz/themes/commit/92b60f2cf7e50f65ac10720fb5c819eac128076e))

## [1.0.0] - 2026-07-04

### Added

- *(publish)* Enhance NPM publishing logic for prereleases and stable releases ([fd98c4f](https://github.com/jakubwarkusz/themes/commit/fd98c4f2b3914e8658ef28718128af6d1ce587d3))

### Fixed

- *(theme)* Enable TypeScript declaration file splitting in bunup.config.ts ([9422947](https://github.com/jakubwarkusz/themes/commit/942294754d4c25c3922a71c03aa20be1a006358a))
- *(theme)* Update size comparison script to use baseline benchmarks ([00b5d81](https://github.com/jakubwarkusz/themes/commit/00b5d8168c417d58f0f43856127444a59a673b63))
- *(theme)* Enhance cookie handling and class attribute management ([a40fe04](https://github.com/jakubwarkusz/themes/commit/a40fe045579545ef852684467d5811a0e050c56e))
- *(theme)* Add entry points for TypeScript declaration file generation in bunup.config.ts ([fd028f8](https://github.com/jakubwarkusz/themes/commit/fd028f874f6e5d5f6ce272a53e948cbd4b84fd64))

### Changed

- Split client provider DOM helpers ([0003149](https://github.com/jakubwarkusz/themes/commit/0003149d06d6dd14c3f6b1413fea638e567459b1))
- *(themes)* Make root entry client-only and remove duplicate provider ([7e48344](https://github.com/jakubwarkusz/themes/commit/7e48344f98b22e0fdda084b713e94c2e86e528d4))

### Miscellaneous

- Update package dependencies and refine theme package structure ([88993a4](https://github.com/jakubwarkusz/themes/commit/88993a4f31ca61f93e82c02b2a3afbfbdacd11ee))

## [0.9.7] - 2026-06-30

### Added

- *(theme)* Enhance bundle size management and comparison ([ff3c65f](https://github.com/jakubwarkusz/themes/commit/ff3c65f64da33889e27ea6965065756e72f19178))
- *(animation)* Improve motion handling with reduced motion support ([c9d6f08](https://github.com/jakubwarkusz/themes/commit/c9d6f08841fdd432c7623ed004a05b52a8b102db))
- *(config)* Add support for next-themes compatibility and enhance webpack configuration ([8eb49de](https://github.com/jakubwarkusz/themes/commit/8eb49de20ddf46e4bb5b17e4f4bdff3c3a18c4c8))
- *(layout)* Integrate ThemeProvider for enhanced theme management and update metadata ([650c1ac](https://github.com/jakubwarkusz/themes/commit/650c1ac33d632ed56f56dab6452eaccbb372ee88))
- *(docs)* Add Vercel configuration and update build script for documentation ([008ca99](https://github.com/jakubwarkusz/themes/commit/008ca99e8347a7e840d224adb2c833dbe786c685))

### Fixed

- *(hero-content)* Adjust layout and typography for improved responsiveness and visual consistency ([00ba071](https://github.com/jakubwarkusz/themes/commit/00ba071af1d79dc369bcb36c8a51502d5c6b1020))
- *(docs)* Resolve react-doctor warnings ([869e3f1](https://github.com/jakubwarkusz/themes/commit/869e3f12deee9ad40d8bac5c2c0cae47657bdd61))
- *(layout)* Update ThemeProvider import path for compatibility with next.js ([e791e85](https://github.com/jakubwarkusz/themes/commit/e791e858a162f59606fff0eea1d60dfa58d5d89b))
- *(build)* Add next-provider as explicit bunup entry to prevent 'use client' chunk contamination ([47d4e02](https://github.com/jakubwarkusz/themes/commit/47d4e02b65fefcfdbc162c95a4c9cb47f7205952))
- *(docs)* Remove next-themes alias causing SSR prerender crash on Vercel ([48aff7b](https://github.com/jakubwarkusz/themes/commit/48aff7b7e4b868f9c802ae5ae9d7d43fd97d69e3))
- *(theme)* Improve cookie handling and validation, enhance script safety ([cdc8b49](https://github.com/jakubwarkusz/themes/commit/cdc8b49e826d5022dfc51701d1066810c5c4b335))
- *(theme)* Update baseline sizes and improve cookie handling logic ([a8446a6](https://github.com/jakubwarkusz/themes/commit/a8446a6c27dae4d677bd5a194994f1c3030a6f62))
- *(theme)* Remove unused client-next-provider entry and update baseline sizes ([394bf8d](https://github.com/jakubwarkusz/themes/commit/394bf8d8a7cdac3a017668b6c1d7dc2c9d7f8ae6))
- *(theme)* Preserve Next server entrypoint boundary ([40984a1](https://github.com/jakubwarkusz/themes/commit/40984a17d145642c37d874659fb670307e4f2757))

### Changed

- *(docs)* Remove old Vercel configuration and add new build script for documentation ([078d298](https://github.com/jakubwarkusz/themes/commit/078d298383b8d13e611649bb7d19d76afc8185e4))
- *(layout)* Remove ThemeProvider ([603480e](https://github.com/jakubwarkusz/themes/commit/603480e38720f55e50dfd5cfc3076302d0b408db))

### Documentation

- Update comparison and features sections for clarity and accuracy ([87e9f47](https://github.com/jakubwarkusz/themes/commit/87e9f47f29fe5f545eb185ff30055909c367eb2c))
- *(theme)* Add security notes and model to ThemeProvider documentation ([b7a5c79](https://github.com/jakubwarkusz/themes/commit/b7a5c79964011f226a3983dff88a1037a7a08a7f))

### Other

- Revert 47d4e02b65fefcfdbc162c95a4c9cb47f7205952 ([faf4e17](https://github.com/jakubwarkusz/themes/commit/faf4e17d1810127ce207b5bf33e4981f81d47f48))

## [0.9.6] - 2026-06-29

### Added

- *(theme)* Enhance theme type definitions and improve theme selection logic ([f4f4220](https://github.com/jakubwarkusz/themes/commit/f4f42204ab2f4aa1c3fffeba4bbf7613516bb448))
- *(theme)* Enhance theme management with typed themes and improved documentation ([fc00e37](https://github.com/jakubwarkusz/themes/commit/fc00e37da6340deb607e63a886e976633812f4b0))
- *(theme)* Add new types for theme configuration and value mapping ([b675a84](https://github.com/jakubwarkusz/themes/commit/b675a8445daeb3b746eaaaf63735095323db5081))

### Documentation

- *(theme)* Update README with new badge styles ([bee08a1](https://github.com/jakubwarkusz/themes/commit/bee08a18db838ac53c3e94cee4ab8fc258d73103))
- *(theme)* Update documentation for typed themes and hybrid storage ([e97e33b](https://github.com/jakubwarkusz/themes/commit/e97e33b5e057dcfd295843fa595639f4b8ccbc55))

## [0.9.4] - 2026-05-21

### Fixed

- *(readme->docs)* Fixed fields values in API reference by [@oliverperzyk](https://github.com/oliverperzyk) ([e0772af](https://github.com/jakubwarkusz/themes/commit/e0772af7494a164c6a8f0d1658881c8574543af6))

### Changed

- *(theme)* Improve transition suppression logic and update documentation ([c6e90b0](https://github.com/jakubwarkusz/themes/commit/c6e90b0e015068ac2e9f12711f6985444e51445c))

## [0.9.2] - 2026-05-07

### Added

- *(themes)* Introduce fine-grained client subpath exports and update documentation ([ecd21c7](https://github.com/jakubwarkusz/themes/commit/ecd21c7e43560c1d6b891b46adda64a91a40ab20))

## [0.9.1] - 2026-05-07

### Added

- *(github->dx)* Added configuration of Dependabot by [@oliverperzyk](https://github.com/oliverperzyk) ([a9358d6](https://github.com/jakubwarkusz/themes/commit/a9358d68a8c4e60f59911bbc89a367fa35621510))
- *(github->funding)* Added funding file by [@oliverperzyk](https://github.com/oliverperzyk) ([e403faa](https://github.com/jakubwarkusz/themes/commit/e403faa3ed28c32736fc61bf6849f58aed996f8e))
- *(themes)* Add bundle size benchmarks by [@salasebas](https://github.com/salasebas) ([7096486](https://github.com/jakubwarkusz/themes/commit/70964864d4f1960e5fbc23b059d8131d6fd6a76d))
- *(themes)* Add followSystem option to theme configuration and update related tests ([b64cb66](https://github.com/jakubwarkusz/themes/commit/b64cb66794df08ac17226eb311e8c1fb2c529e2a))
- *(themes)* Enhance cookie serialization with validation for names, paths, and domains ([7b14a06](https://github.com/jakubwarkusz/themes/commit/7b14a06f18b096cfe73f8f902ebe6f15d4835b35))

### Documentation

- Update README.md to include badge links for npm version and documentation ([18316ca](https://github.com/jakubwarkusz/themes/commit/18316caff850405f4e589f176f6227349c0766b9))

## [0.9.0] - 2026-04-23

### Added

- *(themes)* Add hybrid storage runtime support ([b84c297](https://github.com/jakubwarkusz/themes/commit/b84c29778d1fa7842153746b9079e6df187a52ad))
- *(themes)* Introduce createThemes factory and useThemeEffect hook, along with corresponding tests ([c95278f](https://github.com/jakubwarkusz/themes/commit/c95278fa5c194962e3d7498a963bedfcc87ad2d6))

### Fixed

- *(themes)* Rely on document.defaultView for DOM listeners ([2bf7920](https://github.com/jakubwarkusz/themes/commit/2bf79206b5b3d9cfb3c4eae0eb34aeea335c4401))

### Changed

- *(themes)* Improve regex usage in cookie handling and add lint ignore comments for test helpers and image component ([3313df4](https://github.com/jakubwarkusz/themes/commit/3313df48c5f99b5a9c30fbdf816c956b870c2cde))

### Documentation

- Update documentation for v0.9.0 features including hybrid storage, createThemes factory, and useThemeEffect hook ([b27e4f2](https://github.com/jakubwarkusz/themes/commit/b27e4f2219ec4a9ab9a504103cb31c3afbac6e14))

### Miscellaneous

- *(ci)* Update bun version to 1.3.9 in CI workflow ([20e92da](https://github.com/jakubwarkusz/themes/commit/20e92daf4ea6a81ef777855559d0efcf1b413ba1))
- *(ci)* Update lint command in CI workflow to use biome check ([70c8ca8](https://github.com/jakubwarkusz/themes/commit/70c8ca871026097e4eecf78c33dec47e900753c5))

## [0.8.3] - 2026-04-10

### Fixed

- Prevent duplicate script insertion in ClientNextThemeProvider by using a ref to track insertion state; closes #13 ([0b0f84b](https://github.com/jakubwarkusz/themes/commit/0b0f84bbf960aaa0898afcd630786bf080dd202a))

## [0.8.2] - 2026-04-08

### Fixed

- Exclude system from resolvedTheme type in ThemeContextValue for improved type safety; fixes #11 ([16f8937](https://github.com/jakubwarkusz/themes/commit/16f89373620412a555c5cc4aa72013e3763fb9b6))

## [0.8.1] - 2026-04-07

### Added

- Add CookieOptions type to enhance cookie management in theme provider ([86bc811](https://github.com/jakubwarkusz/themes/commit/86bc81136d9316c5761bccb41a1374548f6f0133))
- Implement cookie management functions and enhance ClientThemeProvider with cookieOptions support ([d6e4497](https://github.com/jakubwarkusz/themes/commit/d6e4497725485b153320be38f2907e9f440b2627))
- Add cookieOptions section to theme provider documentation for enhanced cookie management ([5230301](https://github.com/jakubwarkusz/themes/commit/5230301bec18db768dd2a820be489da246155bc2))

### Fixed

- Forward cookieOptions through ThemeProvider wrappers by Cihat Karli ([aaf7876](https://github.com/jakubwarkusz/themes/commit/aaf787602cfea10957e83d442b48b0f5eb58dabf))

### Changed

- Update SVG dimensions and styles, replace apple-icon and favicon images, and adjust footer and layout image sizes for consistency ([3438494](https://github.com/jakubwarkusz/themes/commit/3438494160e3c12cc28bff908e95b9008230eb3d))

### Documentation

- Update theme provider documentation with improved code examples and formatting for clarity ([ab1d8d9](https://github.com/jakubwarkusz/themes/commit/ab1d8d938f2711c15b645bf200114c17489c41cd))

## [0.7.9] - 2026-03-29

### Fixed

- Validate "system" as a valid stored theme value (refs #7) ([6966751](https://github.com/jakubwarkusz/themes/commit/696675165512c67a943aebe20e53ea425149eed5))

## [0.7.8] - 2026-03-28

### Fixed

- Dynamically import cookies from next/headers to ensure compatibility with server-side rendering; closes #5 ([3e803aa](https://github.com/jakubwarkusz/themes/commit/3e803aa44fe5e7cc498a0ed0f14cecca4b8e6fe3))

## [0.7.7] - 2026-03-25

### Miscellaneous

- Update bun.lock and publish.yml for dependency version upgrades and specific Bun version ([3e9f84e](https://github.com/jakubwarkusz/themes/commit/3e9f84efeabfec950f634f6e7e85f5b86d64e05e))

### Other

- Add Contributor Covenant Code of Conduct ([038086f](https://github.com/jakubwarkusz/themes/commit/038086fdc2f1e06c3f0075361c5eb2c15d2387a3))

## [0.7.6] - 2026-03-25

### Added

- Add motion dependency and enhance UI components with improved styling and accessibility ([112186b](https://github.com/jakubwarkusz/themes/commit/112186b385d906d240add77ac5bc50b20ffc8c0e))
- Refactor Hero component by extracting HeroContent for improved readability and maintainability ([4c2ef6b](https://github.com/jakubwarkusz/themes/commit/4c2ef6b21dfa8d3a5041ae522837f43e5b24cfb5))
- Enhance UI components with motion effects for improved user experience and visual appeal ([118d432](https://github.com/jakubwarkusz/themes/commit/118d4329206cf606e977821d8496a12c826ab77b))

### Documentation

- Update footer links to point to specific API and Examples pages for better navigation ([637b5c8](https://github.com/jakubwarkusz/themes/commit/637b5c8749e1ffaa669496611af1122d9ade0a7b))

### Miscellaneous

- Add sideEffects flag to package.json for better tree-shaking optimization; closes #2 ([30110c2](https://github.com/jakubwarkusz/themes/commit/30110c21306eb0415bf0dd8cf1660d35306cce7b))

## [0.7.5] - 2026-03-22

### Fixed

- Remove node:module from client chunk (bunup target browser) ([0fbb7d9](https://github.com/jakubwarkusz/themes/commit/0fbb7d9b8ff584f83d88ba5b853a3c96b3719b84))

### Documentation

- Add 'always follow system preference' feature to documentation and comparison table for @wrksz/themes ([ef49a0a](https://github.com/jakubwarkusz/themes/commit/ef49a0a468028b73455029ef8fc60162043a3362))

## [0.7.4] - 2026-03-22

### Added

- Add disableTransitionOnChange feature to themeScript and related tests ([0c6ca5b](https://github.com/jakubwarkusz/themes/commit/0c6ca5b2ff3e8f2170e100773047b46f776ebadd))

### Documentation

- Add migration guide for transitioning from next-themes to @wrksz/themes ([4fc1a18](https://github.com/jakubwarkusz/themes/commit/4fc1a18ea6674eea11c456a76059dac546d941ae))
- Clarify disableTransitionOnChange functionality in ThemeProvider documentation ([7fc73b9](https://github.com/jakubwarkusz/themes/commit/7fc73b94325f3b8be2fb890c1c8fda543bc87672))

## [0.7.3] - 2026-03-22

### Added

- Implement getTheme function for cookie-based theme management and export related types ([9cb99f9](https://github.com/jakubwarkusz/themes/commit/9cb99f9d7b256c1c6d70cbf27c21a087f9297f96))

### Documentation

- Add documentation for getTheme function, detailing usage in proxy and layouts ([c4e5b43](https://github.com/jakubwarkusz/themes/commit/c4e5b4335dfb8cc6728187d434666fbfa044f892))
- Add versioning information for getTheme function in documentation ([8f5e0d9](https://github.com/jakubwarkusz/themes/commit/8f5e0d99484af3e1f62cfcde25aeab4d7543ab5a))
- Enhance README with migration notes, comparison table, and updated usage instructions for @wrksz/themes ([6116861](https://github.com/jakubwarkusz/themes/commit/6116861c12819ec9ec83dc53ac7b09ed2529800d))
- Update documentation to include new features for @wrksz/themes, such as per-property transition disabling and reading theme outside React ([63a98e7](https://github.com/jakubwarkusz/themes/commit/63a98e7cfeb09378f1e570bdb9dfd06821a70e8b))
- Update versioning information for getTheme and ThemeProvider to 0.7.3 ([0f1d4b1](https://github.com/jakubwarkusz/themes/commit/0f1d4b1b8757578202613bfa36811ca566b6bc6d))

### Miscellaneous

- Add GitHub release configuration and update publish workflow to include testing and release notes generation ([05a2fdd](https://github.com/jakubwarkusz/themes/commit/05a2fddb804b410020c0f66bfd7c6cc53c51f3da))

## [0.7.2] - 2026-03-22

### Fixed

- Escape special characters in regex for cookie storage retrieval in theme management (developer-controlled prop) ([520c950](https://github.com/jakubwarkusz/themes/commit/520c950fa5b2cb02dacec2ac41ca375b95ce621e))

### Documentation

- Add note about flash in Next.js development mode to server-theme documentation ([3b15ea5](https://github.com/jakubwarkusz/themes/commit/3b15ea5570b464181f2de04631a8b4ef8b60225d))
- Update ThemeProvider usage instructions to clarify async component requirements and provide examples for correct implementation ([d9ea570](https://github.com/jakubwarkusz/themes/commit/d9ea5703f408aba61ad7341c44f7989e2d05e3d9))
- Clarify onThemeChange prop behavior in ThemeProvider documentation and type definitions ([f89a5f4](https://github.com/jakubwarkusz/themes/commit/f89a5f4b3b8da49e58f132a6ac90a900104d760c))
- Update ThemeProvider documentation to clarify disableTransitionOnChange prop functionality and provide usage examples ([784c0b1](https://github.com/jakubwarkusz/themes/commit/784c0b15c9424411edff555e2038040062a2fcff))
- Add guidance on avoiding @media (prefers-color-scheme) in CSS for custom themes to prevent flash of unstyled content ([7724692](https://github.com/jakubwarkusz/themes/commit/7724692eddc1a394f783a667c337b424ecddf66e))
- Update ThemeProvider documentation to reflect changes in disableTransitionOnChange prop versioning ([98b76d4](https://github.com/jakubwarkusz/themes/commit/98b76d459b8f049f6fcc9820c1a1bee9a8765fa2))

## [0.7.1] - 2026-03-22

### Added

- Add bunup configuration for theme package and simplify build scripts ([e0c9294](https://github.com/jakubwarkusz/themes/commit/e0c929437b7325bb54fee81ab41f1a5eb16d264b))

## [0.7.0] - 2026-03-22

### Added

- Add NotFound component and refactor Hero component to use new Button component ([ef05734](https://github.com/jakubwarkusz/themes/commit/ef057343d8ebb8dd71545936de99596fd9aacf74))
- Add apple icon and favicon for improved branding ([3fe840c](https://github.com/jakubwarkusz/themes/commit/3fe840c875310aea91efbdbbb74e7a416818d3f7))
- Update metadataBase URL in layout for improved theme documentation ([2180296](https://github.com/jakubwarkusz/themes/commit/21802969fd45a090a37c64576b6b5b97a393b85f))
- Implement custom OGImage component for dynamic Open Graph images in documentation ([d0d4e15](https://github.com/jakubwarkusz/themes/commit/d0d4e159a97b40acda397df1166ce5f523362573))
- Enhance Hero component to display GitHub stars and update repository link dynamically ([b44a7f2](https://github.com/jakubwarkusz/themes/commit/b44a7f2c27a35beaf0dbe2dec196676817bbfd81))
- Enhance theme management with cookie storage and add ClientNextThemeProvider component ([a664650](https://github.com/jakubwarkusz/themes/commit/a6646503c6f3d9e34512f6d0351d327790b0a344))
- Update ClientThemeProvider and ThemeProvider to support cookie storage for theme management ([8b7b36e](https://github.com/jakubwarkusz/themes/commit/8b7b36e23cc6fd96b4ff3d6896b3067d2e2e5a3a))

### Documentation

- Add README.md for themes package and update banner image URL ([29b9f9b](https://github.com/jakubwarkusz/themes/commit/29b9f9be72284db2e0b00246b2950f6f989400f9))
- Add descriptions to API and Examples metadata for clarity ([d0f1ef3](https://github.com/jakubwarkusz/themes/commit/d0f1ef3d648e99f97c46464b70d4bf108d0f179a))
- Update README.md to clarify import path for ThemeProvider and enhance description of themes package ([071e1ff](https://github.com/jakubwarkusz/themes/commit/071e1ff516fa401e39f8910cdc183797ddb78738))
- Enhance theme documentation with details on cookie storage support and zero-flash SSR implementation ([e1d8949](https://github.com/jakubwarkusz/themes/commit/e1d8949c85798742ba7c65b5633dc360972cac5a))

### Other

- Install Vercel Web Analytics ([83724ba](https://github.com/jakubwarkusz/themes/commit/83724badd9082c5e67100541fce116ca9db0d981))

## [0.6.1] - 2026-03-22

### Fixed

- Update build script to set NODE_ENV to production for optimized builds ([dae3e94](https://github.com/jakubwarkusz/themes/commit/dae3e9403496f47908c9d2fa2f775c8bb1ac02f0))

## [0.6.0] - 2026-03-22

### Added

- Add Next.js support and enhance theme management with new provider structure ([8ad47d0](https://github.com/jakubwarkusz/themes/commit/8ad47d0112e243dce3a3f5102eb7dd03d0bae5dc))

### Documentation

- Update documentation to reflect new import paths and clarify theme management features in Next.js ([6a907d6](https://github.com/jakubwarkusz/themes/commit/6a907d695d784d4078e55ba8a314e12bc5d21cad))

## [0.5.0] - 2026-03-21

### Changed

- Update theme imports to use new client module structure ([c494db7](https://github.com/jakubwarkusz/themes/commit/c494db76f9072cce2c0f172722d9ddaaf14e1f18))

### Documentation

- Update layout metadata to improve description and add new keywords for enhanced theme management features ([8b18e5e](https://github.com/jakubwarkusz/themes/commit/8b18e5e17af481f8cc5bfa16d0ebb37d4266916d))

## [0.4.1] - 2026-03-21

### Added

- Migrate docs ([7db70bc](https://github.com/jakubwarkusz/themes/commit/7db70bc2784d6dd9a853334dcf2770fdc5e9ded0))
- Enhance mobile and desktop views in Comparison component with responsive labels ([af72ec0](https://github.com/jakubwarkusz/themes/commit/af72ec0bd37225193818e0c1453727a5eb489fef))
- Implement responsive labels for Yes, No, Fixed, and Bug components in mdx.tsx ([34df62a](https://github.com/jakubwarkusz/themes/commit/34df62a0c5e135325b094528d76a088e8be88308))

### Changed

- Move to packages/themes ([717171c](https://github.com/jakubwarkusz/themes/commit/717171c89222d8f158f3271027521b8f71fe627b))

### Miscellaneous

- Update workflows to set working directory for themes and restrict paths for CI triggers ([b509407](https://github.com/jakubwarkusz/themes/commit/b509407f7995680bef1aa96d71e22bc52dd04385))

## [0.4.0] - 2026-03-21

### Added

- Update bug report template and add new framework support request template for enhanced issue tracking ([f013800](https://github.com/jakubwarkusz/themes/commit/f013800f0cbdde720c5d8dd2e3e3c8ee0bc8f609))
- Add @testing-library/react as a devDependency for improved testing capabilities ([9a3ca5d](https://github.com/jakubwarkusz/themes/commit/9a3ca5dce4a91897b9fb697691b0bb6785ab20d1))
- Add ThemedImage component for theme-aware image rendering and update README with usage examples ([13709bc](https://github.com/jakubwarkusz/themes/commit/13709bcfaacdc40b93012e493592d49b3c78cca5))
- Export useThemeValue hook and ThemedImageProps type for enhanced theming capabilities ([b13d2af](https://github.com/jakubwarkusz/themes/commit/b13d2af3bdef79911fd7272ad474fe7c5518c7cb))

### Fixed

- Update theme initialization logic to ignore stored value when followSystem is true and add corresponding tests ([2579529](https://github.com/jakubwarkusz/themes/commit/25795294003c2263557f563981f88d780c2e1a78))
- Enhance storage event handling to ignore events from sessionStorage and add corresponding test case ([4438c9b](https://github.com/jakubwarkusz/themes/commit/4438c9b0a0d0506a1f36735142a3b6d725cb6ad4))

### Documentation

- Add section on scoped theming to README with examples for applying different themes per section ([5959a6a](https://github.com/jakubwarkusz/themes/commit/5959a6afdf173cb0c8cff09777629c3a39231e4d))
- Add useThemeValue hook documentation to README and implement the hook for theme-based value retrieval ([0a122eb](https://github.com/jakubwarkusz/themes/commit/0a122ebc261a2346c4d841b19bd8dd1cb3e33dd1))
- Clarify README entries for followSystem and nonce props in ThemeToggle component ([c29a160](https://github.com/jakubwarkusz/themes/commit/c29a160f4e53027b6569614d1f3e65859f082020))

## [0.3.1] - 2026-03-21

### Added

- Update class handling in themeScript and ClientThemeProvider to support multiple space-separated classes ([d6b85f9](https://github.com/jakubwarkusz/themes/commit/d6b85f99188034e2485e08f7e76158258d0714bf))
- Introduce initialTheme prop for server-side theme initialization and update README with usage examples ([e041383](https://github.com/jakubwarkusz/themes/commit/e041383bde7f52a0468e5d9ad23b9c74b9420164))
- Add issue templates for bug reports and feature requests to improve issue tracking ([59b50ce](https://github.com/jakubwarkusz/themes/commit/59b50ceb3d7df4778ff5d7299b917310852d0de5))

### Documentation

- Add section on using ClientThemeProvider for nested providers in Client Components to README ([9fd506f](https://github.com/jakubwarkusz/themes/commit/9fd506ff9f19165e626e2396f6e39a56ff0d9786))

## [0.3.0] - 2026-03-21

### Added

- Add testing framework setup and implement theme script tests for comprehensive theme management validation ([d8881b3](https://github.com/jakubwarkusz/themes/commit/d8881b33e11631337c1ca41e518896bc22bb0888))
- Add followSystem prop to ThemeProvider and ClientThemeProvider for enhanced theme preference management ([0b3438a](https://github.com/jakubwarkusz/themes/commit/0b3438a7def2a0b3cdecf161026f6a35957fec41))
- Enhance ClientThemeProvider to re-apply theme on bfcache restore and history navigation ([1c9d19c](https://github.com/jakubwarkusz/themes/commit/1c9d19ccb057851927a0c58d484e2730362ef488))
- Per-instance store with useSyncExternalStore, fix nested providers and SSR isolation ([4c3e99f](https://github.com/jakubwarkusz/themes/commit/4c3e99f0352501f208833be47195e456ca91aa63))

### Miscellaneous

- Add missing plus after React 19 ([7b66194](https://github.com/jakubwarkusz/themes/commit/7b66194f42c86795a86a4eb37a197622b43b717b))
- Add happy-dom and related types to dependencies, and include test script in package.json ([c8eb5a7](https://github.com/jakubwarkusz/themes/commit/c8eb5a7640450495598d7e5c03d738d512c83f4f))

## [0.2.1] - 2026-03-21

### Added

- Add themeColors support to ScriptConfig and themeScript for dynamic meta theme-color management ([d7b9536](https://github.com/jakubwarkusz/themes/commit/d7b9536221444a1fa0df353780b2b8b6e2786ba5))
- Pass themeColor prop to ThemeProvider for improved theme customization ([571da85](https://github.com/jakubwarkusz/themes/commit/571da85e3133b1028d52b9ee7374e2172fa98a7f))
- Implement themeStore for centralized theme state management and update ClientThemeProvider to utilize it ([837ca5b](https://github.com/jakubwarkusz/themes/commit/837ca5b2258e1d65f9a5704b8101382a22cc1779))

### Documentation

- Update README with comprehensive usage instructions and examples for @wrksz/themes, including setup, API details, and theme customization options ([9121d6b](https://github.com/jakubwarkusz/themes/commit/9121d6b1c52ba041079fec952b6521592ccfc8d8))

## [0.2.0] - 2026-03-21

### Added

- Implement theme management script with configuration and serialization functionality ([0676329](https://github.com/jakubwarkusz/themes/commit/0676329bd0a588536d6eefb5b870a5349dd8c756))
- Add color scheme support and forced theme option in theme management script ([63b2fa1](https://github.com/jakubwarkusz/themes/commit/63b2fa1b2d12a965823fcba1d63ae7611ca0ced1))
- Add type exports for theme-related components in index file ([174903b](https://github.com/jakubwarkusz/themes/commit/174903bcf63d85fd3ac5355cf8f22e643be7a703))
- Create ThemeContext and useTheme hook for theme management ([55a170e](https://github.com/jakubwarkusz/themes/commit/55a170ea01ade701f2c67f83cb3faedbe7c391d0))
- Implement ClientThemeProvider and ThemeProvider for enhanced theme management ([ad71472](https://github.com/jakubwarkusz/themes/commit/ad7147270e85fd7e64a036dd2832fdfbe4aabe2e))

### Fixed

- Remove unnecessary registry-url from node setup in publish workflow ([7c09152](https://github.com/jakubwarkusz/themes/commit/7c09152ae08be42113887c6a4dafd18d8c475b45))
- Correct comment formatting in ThemeContextValue type definition (AI-generated docs 😳) ([b766abc](https://github.com/jakubwarkusz/themes/commit/b766abce274df203b66c6dcc23fd7b86159dd809))
- Update npm publish workflow to include registry URL and provenance flag ([fc4f8ee](https://github.com/jakubwarkusz/themes/commit/fc4f8ee60ab635c7d716b87ceb08488ff025b0ea))
- Add repository url to package.json ([46e4e44](https://github.com/jakubwarkusz/themes/commit/46e4e441f2759c9c8c8d358309ba8d350298e9cb))

### Changed

- Remove unused button component and associated styles, add theme-related types ([0be7497](https://github.com/jakubwarkusz/themes/commit/0be74972ab4b79e41e0458fc0e00613831bb9462))

### Miscellaneous

- Update package version to 0.0.0 and enhance publish workflow with version setting script ([623a8fd](https://github.com/jakubwarkusz/themes/commit/623a8fdf5d3740592afd1aaba7a19f1bd2cda778))

## [0.1.1] - 2026-03-21

### Fixed

- Enhance publish workflow by adding node setup and updating npm publish command ([a1394de](https://github.com/jakubwarkusz/themes/commit/a1394dedfba5c1089968a73613e84200076b4626))

## [0.1.0] - 2026-03-21

### Added

- Project initialization ([0edf710](https://github.com/jakubwarkusz/themes/commit/0edf710f9f681fa23c2d365cf9d3b2b2e677b845))
- Add biome configuration and integrate linter/formatter with lefthook support ([c8e1181](https://github.com/jakubwarkusz/themes/commit/c8e118169b49efc5cad82ebe8d42f186e5885c59))
- Add CI and publish workflows for automated linting, type-checking, and npm publishing ([f0e16fc](https://github.com/jakubwarkusz/themes/commit/f0e16fc2b75274d3d60da54157f0500f7e92eb27))

### Fixed

- Update build command in CI and publish workflows to use 'bun run build' ([197c298](https://github.com/jakubwarkusz/themes/commit/197c298999a418dff18a482bc6bb28f46d679adc))
- Update prepare script to conditionally install lefthook based on CI environment ([b80b132](https://github.com/jakubwarkusz/themes/commit/b80b13216242aa9e2db1ec0a4c1a3ef730b63c95))
- Update npm publish step to include authentication token configuration ([d044250](https://github.com/jakubwarkusz/themes/commit/d0442509824b0342294f9dd8b811a68581b746e4))

### Other

- Initial commit ([b02cc49](https://github.com/jakubwarkusz/themes/commit/b02cc498a9e984409781ca39562eff22c79827d7))

[2.1.1]: https://github.com/jakubwarkusz/themes/compare/v2.1.0..v2.1.1
[2.1.0]: https://github.com/jakubwarkusz/themes/compare/v2.0.4..v2.1.0
[2.0.4]: https://github.com/jakubwarkusz/themes/compare/v2.0.3..v2.0.4
[2.0.3]: https://github.com/jakubwarkusz/themes/compare/v2.0.2..v2.0.3
[2.0.2]: https://github.com/jakubwarkusz/themes/compare/v2.0.1..v2.0.2
[2.0.1]: https://github.com/jakubwarkusz/themes/compare/v2.0.0..v2.0.1
[2.0.0]: https://github.com/jakubwarkusz/themes/compare/v1.2.0..v2.0.0
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
