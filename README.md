# JavaScript Configuration

A library that automatically sets up preferred configuration for any JavaScript project.

## What This Provides

- TypeScript
- ESLint
- StyleLint
- Git Hooks
- Vite
- Vitest
- SWC
- NPM Scripts
  - With Cypress Scripts, Not Cypress

## Test Support

### jest-fp-ts

The `@relmify/jest-fp-ts` package will be automatically setup in tests when that package is present in the application.

## Git Hooks

### Pre-Commit

Before each commit, eslint & stylelint will be run on the appropriate files.

## Commands

| Command       | Arguments                          | Description                                                        |
|---------------|------------------------------------|--------------------------------------------------------------------|
| c-build-app   | None                               | Build a full application with vite                                 |
| c-build-lib   | None                               | Build a library with SWC & TypeScript                              |
| c-cypress     | None                               | Run the cypress suite headless (requires Cypress)                  |
| c-cypress-dev | None                               | Run the cypress dev tool (requires Cypress)                        |
| c-eslint      | An optional path to a file to lint | Run eslint on either a single file or the whole project.           |
| c-init        | None                               | Initialize the whole project. Automatically runs after installing. |
| c-log         | None                               | See the logs created by these commands to debug issues.            |
| c-start       | None                               | Start the vite dev server                                          |
| c-stylelint   | An optional path to a file to lint | Run stylelint on either a single file or the whole project.        |
| c-test        | None                               | Run the vitest suite                                               |
| c-type-check  | None                               | Perform TypeScript type checking on the codebase.                  |
| c-validate    | None                               | Run all validation scripts for the project.                        |