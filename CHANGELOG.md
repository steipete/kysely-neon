# Changelog

## Unreleased

- Fix HTTP queries with the supported `@neondatabase/serverless` 0.4.26 callable API while retaining the 1.x `query()` API. Thanks @SebTardif.
- Run the complete validation gate on Node.js 24 with the pinned pnpm version, and make release publishing manual with a dry-run default.
- Allow release previews without npm publishing credentials.
