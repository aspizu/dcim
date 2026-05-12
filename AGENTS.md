MUST use `pnpm` instead of `npm` or `yarn`.
Prefer absolute imports over relative imports unless shorter (Ex: `#services/api`)
MUST run `git add -A && .git/hooks/pre-commit` before finalizing a task.
MUST NOT suppress eslint/oxlint rules or typescript errors.
functions must either be 100% pure, or be 100% side-effectful
if a function returns a value other than undefined, then it must be pure
if a function has side-effects, then it must only return undefined
JSDoc documentation must be written for all public API, except for internal API.
Use @preact/signals-react for state management, signals are tracked automatically, assume it works (IT WORKS, signals are not the issue with ur bugs)
