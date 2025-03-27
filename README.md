# Project Structure for AI

A Visual Studio Code extension that automatically maintains a structured overview of your project's files and directories. It helps AI assistants like GitHub Copilot understand your project context when files aren't open, improving their suggestions and assistance.

## Features

- Keeps an up-to-date listing of all files in your project
- Works in two modes: Manual or Auto
- Configurable exclusion of directories and files
- Status bar controls for easy mode switching and manual updates
- Detects and documents file relationships (imports/exports)
- Framework-specific route detection for popular web frameworks
- Performance optimizations for large projects

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions view
3. Search for "Project Structure"
4. Click Install

## Usage

Once installed, the extension will create a `.vscode/project-structure.md` file in your workspace that contains a hierarchical listing of all files and folders in your project.

### Status Bar Controls

The extension adds two items to the status bar:

- **Project Structure: Manual/Auto** - Shows the current mode. Click to toggle between Manual and Auto modes.
- **Refresh Icon** - Click to manually update the file listing (only visible in Manual mode).

### Modes

- **Manual Mode**: The file listing is only updated when you manually trigger an update
- **Auto Mode**: The file listing is automatically updated whenever files are added, deleted, or changed

### Commands

Open the Command Palette (`Ctrl+Shift+P`) and type:

- `Project Structure: Toggle State` - Switch between Manual and Auto modes
- `Project Structure: Update Now` - Update the file listing immediately
- `Project Structure: Clear Cache` - Clear the cached file relationships data

## Configuration

You can configure the extension via the VS Code settings:

VS Code Settings UI:

1. Open Settings (Ctrl+, or File > Preferences > Settings)
2. Search for "Project Structure"
3. Edit the settings to customize the behavior

| Setting | Description | Default |
|---------|-------------|---------|
| `projectStructure.excludeDirectories` | Directories to exclude | `[".git", "node_modules"]` |
| `projectStructure.excludeFiles` | File patterns to exclude | `["*.vsix", "*.log"]` |
| `projectStructure.enableLogging` | Enable logging to the output channel | `false` |
| `projectStructure.includeRelationships` | Include file import/export relationships | `true` |
| `projectStructure.maxFileSize` | Maximum file size in KB to parse (0 for no limit) | `1024` |
| `projectStructure.detectFrameworks` | Enable/disable specific framework route detection | See below |

### Framework Detection

The extension can detect routes and structure for popular web frameworks:

```json
"projectStructure.detectFrameworks": {
  "express": true,
  "react": true, 
  "next": true,
  "vue": true,
  "nestjs": true
}
```

### Advanced Configuration

You can also configure these settings in your `settings.json`:

1. Open settings.json (Ctrl+Shift+P > "Preferences: Open Settings (JSON)")
2. Add or edit:

```json
"projectStructure.excludeDirectories": [
  ".git",
  "node_modules",
  "dist",
  "bin"
],
"projectStructure.excludeFiles": [
  "*.vsix",
  "*.log",
  "*.zip",
  "package-lock.json"
],
"projectStructure.enableLogging": true,
"projectStructure.includeRelationships": true,
"projectStructure.maxFileSize": 2048,
"projectStructure.detectFrameworks": {
  "express": true,
  "react": true,
  "next": true,
  "vue": false,
  "nestjs": true
}
```

You can set different exclusions per project by adding them to settings.json in a workspace
After updating the settings, they take effect immediately for new file operations and on the next update of the file listing.

## Make Copilot aware of the file

Currently, GitHub Copilot doesn't have a built-in way to automatically attach specific files to every query's context. However, there are some workarounds you could try:

Create a .github/copilot-instructions.md file in your repository.

Add the following instruction to the file:

```
Always refer to the .vscode/project-structure.md file for the most up-to-date project structure before suggesting file creations or modifications.
```

Ensure that custom instructions are enabled in your Copilot settings. With this setup, Copilot will be instructed to check the project-structure.md before making suggestions about file creation or modification, helping it make more informed decisions about your project structure.

### Other approaches

1. **Keep the Project Structure document open**
   - Split your editor and keep the generated project-structure.md open as you work
   - Copilot tends to prioritize open files in its context window

2. **Use @file references in comments**

   ```javascript
   // See project structure in .vscode/project-structure.md
   ```

3. **Use workspace-level prompts**
   - In VS Code with Copilot Chat:

   ```
   /workspace Use .vscode/project-structure.md as context for project structure

## Known Issues

None...yet.

## Release Notes

### 2.0.0

Added ability to list routes for various API systems.
Added settings to control which systems to watch for.
Added ability to not process files above a certain size.

First release.

### 1.0.0

Initial release of Project Structure for AI.
