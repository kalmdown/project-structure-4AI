# Project Files for AI

A likely short term need to deal with VSCode LLMs inability to keep track of issues across files of a project that are not open. This Visual Studio Code extension automatically maintains a markdown file with your project's file structure so you can point Copilot or similar tool to it for context.

## Features

- Keeps an up-to-date listing of all files in your project
- Works in two modes: Manual or Auto
- Configurable exclusion of directories and files
- Status bar controls for easy mode switching and manual updates

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions view
3. Search for "Project Files"
4. Click Install

## Usage

Once installed, the extension will create a `.vscode/project-files.md` file in your workspace that contains a hierarchical listing of all files and folders in your project.

### Status Bar Controls

The extension adds two items to the status bar:

- **Project Files: Manual/Auto** - Shows the current mode. Click to toggle between Manual and Auto modes.
- **Refresh Icon** - Click to manually update the file listing (only visible in Manual mode).

### Modes

- **Manual Mode**: The file listing is only updated when you manually trigger an update
- **Auto Mode**: The file listing is automatically updated whenever files are added, deleted, or changed

### Commands

Open the Command Palette (`Ctrl+Shift+P`) and type:

- `Project Files: Toggle State` - Switch between Manual and Auto modes
- `Project Files: Update Now` - Update the file listing immediately

## Configuration

You can configure directories and files to exclude from the listing via the VS Code settings:

VS Code Settings UI:
1. Open Settings (Ctrl+, or File > Preferences > Settings)
2. Search for "Project Files"
3. Edit the arrays for "Exclude Directories" and "Exclude Files"

| Setting | Description | Default |
|---------|-------------|---------|
| `projectFiles.excludeDirectories` | Directories to exclude | `[".git", "node_modules"]` |
| `projectFiles.excludeFiles` | File patterns to exclude | `["*.vsix", "*.log"]` |

### Advanced Configuration

You can also configure these settings in your `settings.json`:
1. Open settings.json (Ctrl+Shift+P > "Preferences: Open Settings (JSON)")
2. Add or edit:

```json
"projectFiles.excludeDirectories": [
  ".git",
  "node_modules",
  "dist",
  "bin"
],
"projectFiles.excludeFiles": [
  "*.vsix",
  "*.log",
  "*.zip",
  "package-lock.json"
]
```
You can set different exclusions per project by adding them to settings.json in a workspace
After updating the settings, they take effect immediately for new file operations and on the next update of the file listing.

## USE OF THE project-files.md file

Currently, GitHub Copilot doesn't have a built-in way to automatically attach specific files to every query's context. However, there are some workarounds you could try:

### Make Copilot aware of the file

Create a .github/copilot-instructions.md file in your repository5.

Add the following instruction to the file:
```
Always refer to the .vscode/file_listing.md file for the most up-to-date project structure before suggesting file creations or modifications.
```

Ensure that custom instructions are enabled in your Copilot settings. With this setup, Copilot will be instructed to check the project-files.md before making suggestions about file creation or modification, helping it make more informed decisions about your project structure.

### Other approaches

1. **Keep the Project Files document open**
   - Split your editor and keep the generated project-files.md open as you work
   - Copilot tends to prioritize open files in its context window

2. **Use @file references in comments**
   ```javascript
   // See project structure in .vscode/project-files.md
   ```

3. **Use workspace-level prompts**
   - In VS Code with Copilot Chat:
   ```
   /workspace Use .vscode/project-files.md as context for project structure

## Known Issues

None...yet.

## Release Notes

First release.

### 1.0.0

Initial release of Project Files for AI.