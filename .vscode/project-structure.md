# Project Structure

This file maintains an up-to-date list of project files and structure.

## File Structure

- 📁 `icons/`
  - 📄 `icons\extension-icon.png` (Unknown)
  - 📄 `icons\project-files_icon.svg` (Unknown)
  - 📄 `icons\project-list_status-bar-icon_Auto.svg` (Unknown)
  - 📄 `icons\project-list_status-bar-icon_Manual.svg` (Unknown)
  - 📄 `icons\project-list_status-bar-icon_Off.svg` (Unknown)
  - 📄 `icons\publisher-icon_kd.png` (Unknown)
  - 📄 `icons\status-bar_icons_Auto.png` (Unknown)
  - 📄 `icons\status-bar_icons_Manual.png` (Unknown)
  - 📄 `icons\status-bar_icons_Off.png` (Unknown)
  - 📄 `icons\status-bar_icons.afdesign~lock~` (Unknown)
- 📁 `src/`
  - 📁 `src\test/`
    - 📁 `src\test\suite/`
      - 📄 `src\test\suite\index.ts` (TypeScript)
        - *Imports:* `path`, `mocha`, `glob`
        - *Exports:* `run`
    - 📄 `src\test\extension.test.ts` (TypeScript)
      - *Imports:* `assert`, `vscode`, `fs`, `path`, `sinon`, `../extension`
      - *Routes Provided:* `GET /users`, `POST /users`, `GET /users/:id`, `GET /about`, `GET /about`, `GET /api/users`, `POST /api/users`, `PUT /api/users`, `GET /api/users/:id`, `GET /api/posts/:postId/comments/:commentId`, `GET /dashboard`, `GET /profile/:userId`
    - 📄 `src\test\routeDetection.test.ts` (TypeScript)
      - *Imports:* `assert`, `vscode`, `fs`, `path`, `../extension`
      - *Routes Provided:* `GET /about`
    - 📄 `src\test\runTest.ts` (TypeScript)
      - *Imports:* `path`, `@vscode/test-electron`
  - 📄 `src\extension.ts` (TypeScript)
    - *Imports:* `vscode`, `fs`, `path`, `typescript`
    - *Exports:* `activate`, `deactivate`, `getTestAPI`
    - *Routes Provided:* `GET /path`, `GET /about`, `GET /users/:id`, `GET , rootPath);
    
    const fileListingPath = path.join(rootPath, `, `GET /about`, `GET /about`, `GET /about`, `GET /about`
    - *Routes Consumed:* `/api/users`, `/api/data`
- 📄 `.gitignore` (Unknown)
- 📄 `.vscode-test.mjs` (Unknown)
- 📄 `.vscodeignore` (Unknown)
- 📄 `CHANGELOG.md` (Markdown)
- 📄 `eslint.config.mjs` (Unknown)
- 📄 `LICENSE.md` (Markdown)
- 📄 `package-lock.json` (JSON)
- 📄 `package.json` (JSON)
- 📄 `README.md` (Markdown)
- 📄 `test-workspace.code-workspace` (Unknown)
- 📄 `tsconfig.json` (JSON)
- 📄 `vsc-extension-quickstart.md` (Markdown)
- 📄 `webpack.config.js` (JavaScript)
  - *Imports:* `path`
  - *Exports:* `module.exports`
- 📄 `webpack.test.config.js` (JavaScript)
  - *Exports:* `module.exports`
  - *Routes Provided:* `GET commonjs path`

---
Last updated: 2025-03-27T04:47:23.269Z
