# Project Files for AI

A Visual Studio Code extension that automatically maintains a markdown file with your project's file structure that you can point Copilot or similar tool to for context.

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

1. Open Settings (`Ctrl+,`)
2. Search for "Project Files"
3. Edit these settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `projectFiles.excludeDirectories` | Directories to exclude | `[".git", "node_modules"]` |
| `projectFiles.excludeFiles` | File patterns to exclude | `["*.vsix", "*.log"]` |

### Advanced Configuration

You can also configure these settings in your `settings.json`:

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

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

