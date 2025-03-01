// src\extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const LOG_PREFIX = '[Project Files]';

let outputChannel: vscode.OutputChannel;

function log(message: string) {
    if (!outputChannel) {
        // Create channel if it doesn't exist
        outputChannel = vscode.window.createOutputChannel('Project Files');
        outputChannel.show(true);
    }
    outputChannel.appendLine(`${LOG_PREFIX} ${message}`);
}

function logError(message: string, error?: any) {
    if (!outputChannel) {
        // Create channel if it doesn't exist
        outputChannel = vscode.window.createOutputChannel('Project Files');
        outputChannel.show(true);
    }
    outputChannel.appendLine(`${LOG_PREFIX} ERROR: ${message}`);
    if (error) {
        outputChannel.appendLine(`${LOG_PREFIX} Error details: ${error}`);
    }
}

enum WatchState {
    Manual = 'manual',
    Auto = 'auto'
}

// Add a second status bar item for the refresh button
let statusBarItem: vscode.StatusBarItem;
let refreshStatusBarItem: vscode.StatusBarItem; // New separate item for refresh
let currentState: WatchState = WatchState.Manual; // Default to Manual instead of Off
let fileWatcher: vscode.FileSystemWatcher | undefined;

function shouldIgnoreFile(uri: vscode.Uri): boolean {
    const filePath = uri.fsPath;
    const fileName = path.basename(filePath);
    
    // Ignore our own file
    if (filePath.endsWith('project-files.md') && filePath.includes('.vscode')) {
        return true;
    }
    
    // Get exclude settings
    const config = vscode.workspace.getConfiguration('projectFiles');
    const excludeDirs = config.get<string[]>('excludeDirectories') || ['.git', 'node_modules'];
    const excludeFiles = config.get<string[]>('excludeFiles') || ['*.vsix', '*.log'];
    
    // Check if path contains any excluded directory
    const normalizedPath = filePath.replace(/\\/g, '/');
    for (const dir of excludeDirs) {
        if (normalizedPath.includes(`/${dir}/`) || normalizedPath.endsWith(`/${dir}`)) {
            return true;
        }
    }
    
    // Check file patterns
    const filePatterns = excludeFiles.map(pattern => {
        return new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
    });
    
    return filePatterns.some(pattern => pattern.test(fileName));
}

export function activate(context: vscode.ExtensionContext) {
    // Force immediate console output for debugging
    console.clear();
    console.log('[Project Files] Extension is starting...');
    
    // Create and show output channel immediately
    outputChannel = vscode.window.createOutputChannel('Project Files');
    context.subscriptions.push(outputChannel);
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine('[Project Files] Extension is activating');
    
    try {
        // Register the toggle command
        let disposable = vscode.commands.registerCommand('projectFiles.toggleState', () => {
            log(`Toggle state from: ${currentState}`);
            if (currentState === WatchState.Manual) {
                currentState = WatchState.Auto;
                log('Switching to Auto mode');
            } else {
                currentState = WatchState.Manual;
                log('Switching to Manual mode');
            }
            updateFileListing(); // Always update on toggle
            updateStatusBarItem(context);
        });
        context.subscriptions.push(disposable);
        
        // Register run once command (for Manual mode)
        disposable = vscode.commands.registerCommand('projectFiles.runOnce', () => {
            log('Manual update triggered');
            updateFileListing();
        });
        context.subscriptions.push(disposable);
        
        // Create mode status bar item
        statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
             1000  // Much higher priority
        );
        statusBarItem.command = 'projectFiles.toggleState';
        context.subscriptions.push(statusBarItem);
        
        // Create separate refresh button
        refreshStatusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            999  // Just one less than the main item
        );
        refreshStatusBarItem.text = "$(refresh)";
        refreshStatusBarItem.tooltip = "Update project files listing now";
        refreshStatusBarItem.command = 'projectFiles.runOnce';
        context.subscriptions.push(refreshStatusBarItem);
        
        // Register custom status bar click handler
        let handleStatusBarClick = vscode.commands.registerCommand('_projectFiles.handleStatusBarClick', async () => {
            // Show a quick pick to let user choose action
            const action = await vscode.window.showQuickPick(
                ['Toggle Mode', 'Update Now'], 
                { placeHolder: 'Select action' }
            );
            
            if (action === 'Toggle Mode') {
                vscode.commands.executeCommand('projectFiles.toggleState');
            } else if (action === 'Update Now') {
                vscode.commands.executeCommand('projectFiles.runOnce');
            }
        });
        context.subscriptions.push(handleStatusBarClick);
        
        // Initial status bar update
        updateStatusBarItem(context);
        
        // Initial file listing
        updateFileListing();
        
        disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
            // Always update since we only have Manual and Auto modes now
            updateFileListing();
        });
        context.subscriptions.push(disposable);

        // Add this new code for file rename handling
        disposable = vscode.workspace.onDidRenameFiles((e) => {
            if (currentState === WatchState.Auto) {
                // Check if any of the renamed files should not be ignored
                for (const rename of e.files) {
                    if (!shouldIgnoreFile(rename.oldUri) || !shouldIgnoreFile(rename.newUri)) {
                        log(`File renamed: ${rename.oldUri.fsPath} -> ${rename.newUri.fsPath}`);
                        updateFileListing();
                        break; // Only need to update once if multiple files are renamed
                    }
                }
            }
        });
        context.subscriptions.push(disposable);

        outputChannel.appendLine(`${LOG_PREFIX} Extension activated successfully`);
    } catch (error) {
        console.error('[Project Files] Activation error:', error);
        outputChannel.appendLine(`[Project Files] ERROR during activation: ${error}`);
    }
}

function updateStatusBarItem(context: vscode.ExtensionContext): void {
    // Dispose of file watcher first
    if (fileWatcher) {
        fileWatcher.dispose();
        fileWatcher = undefined;
    }

    if (currentState === WatchState.Manual) {
        // In Manual mode - show state text without refresh icon
        statusBarItem.text = "Project Files: Manual";
        statusBarItem.tooltip = "Click to toggle to Auto mode";
        statusBarItem.command = 'projectFiles.toggleState';
        
        // Show the separate refresh button
        refreshStatusBarItem.show();
    } else {
        // Auto mode
        statusBarItem.text = "Project Files: Auto";
        statusBarItem.tooltip = "Click to toggle to manual mode";
        statusBarItem.command = 'projectFiles.toggleState';
        
        // Hide the refresh button in Auto mode
        refreshStatusBarItem.hide();
        
        // Setup file watcher
        fileWatcher = setupFileWatcher();
    }
    
    statusBarItem.show();
}

// Update updateFileListing to always run since we don't have Off mode
function updateFileListing(): void {
    log('Starting file listing update');
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        logError('No workspace folders found');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    
    const fileListingPath = path.join(rootPath, '.vscode', 'project-files.md');

    try {
        // Ensure .vscode directory exists
        const vscodePath = path.join(rootPath, '.vscode');
        if (!fs.existsSync(vscodePath)) {
            fs.mkdirSync(vscodePath);
        }

        const config = vscode.workspace.getConfiguration('projectFiles');
        const excludeDirs = config.get<string[]>('excludeDirectories') || ['.git', 'node_modules'];
        const excludeFiles = config.get<string[]>('excludeFiles') || ['*.vsix', '*.log'];

        // Convert file patterns to RegExp objects
        const filePatterns = excludeFiles.map(pattern => {
            // Convert glob pattern to RegExp
            return new RegExp('^' + 
                pattern.replace(/\./g, '\\.')
                       .replace(/\*/g, '.*')
                       .replace(/\?/g, '.') + 
                '$', 'i');
        });
        
        let fileListing = '# Project Files\n\n';
        fileListing += 'This file maintains an up-to-date list of project files and structure.\n\n';
        fileListing += '## File Structure\n\n';

        function traverseDirectory(dir: string, indent: string = ''): void {
            const files = fs.readdirSync(dir);
            files.sort((a, b) => {
                // Directories first, then files
                const aStats = fs.statSync(path.join(dir, a));
                const bStats = fs.statSync(path.join(dir, b));
                if (aStats.isDirectory() && !bStats.isDirectory()) {return -1;}
                if (!aStats.isDirectory() && bStats.isDirectory()) {return 1;}
                return a.localeCompare(b);
            });

            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                const relativePath = path.relative(rootPath, filePath);
                
                // Check if path contains any excluded directory
                if (stats.isDirectory()) {
                    // Check if this directory or any parent directory is in the exclude list
                    const pathParts = relativePath.split(path.sep);
                    if (pathParts.some(part => excludeDirs.includes(part))) {
                        return;
                    }
                }

                // Skip excluded files
                if (!stats.isDirectory() && filePatterns.some(pattern => pattern.test(file))) {
                    return;
                }

                if (stats.isDirectory()) {
                    fileListing += `${indent}- 📁 \`${relativePath}/\`\n`;
                    traverseDirectory(filePath, indent + '  ');
                } else {
                    fileListing += `${indent}- 📄 \`${relativePath}\`\n`;
                }
            });
        }

        traverseDirectory(rootPath);

        // Add timestamp at the bottom
        fileListing += '\n---\n';
        fileListing += `Last updated: ${new Date().toISOString()}\n`;

        fs.writeFileSync(fileListingPath, fileListing);
        log('File listing successfully updated');
    } catch (error) {
        logError('Failed to update file listing', error);
    }
}

function setupFileWatcher() {
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");
    
    // Helper function to check if a file should be ignored
    const shouldIgnoreFile = (uri: vscode.Uri) => {
        const filePath = uri.fsPath;
        const fileName = path.basename(filePath);
        
        // Ignore our own file
        if (filePath.endsWith('project-files.md') && filePath.includes('.vscode')) {
            return true;
        }
        
        // Get exclude settings
        const config = vscode.workspace.getConfiguration('projectFiles');
        const excludeDirs = config.get<string[]>('excludeDirectories') || ['.git', 'node_modules'];
        const excludeFiles = config.get<string[]>('excludeFiles') || ['*.vsix', '*.log'];
        
        // Check if path contains any excluded directory
        const normalizedPath = filePath.replace(/\\/g, '/');
        for (const dir of excludeDirs) {
            if (normalizedPath.includes(`/${dir}/`) || normalizedPath.endsWith(`/${dir}`)) {
                return true;
            }
        }
        
        // Check file patterns
        const filePatterns = excludeFiles.map(pattern => {
            return new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
        });
        
        return filePatterns.some(pattern => pattern.test(fileName));
    };
    
    // Handle file creation
    fileSystemWatcher.onDidCreate((uri) => {
        if (currentState === WatchState.Auto && !shouldIgnoreFile(uri)) {
            log(`File created: ${uri.fsPath}`);
            updateFileListing();
        }
    });

    // Handle file deletion
    fileSystemWatcher.onDidDelete((uri) => {
        if (currentState === WatchState.Auto && !shouldIgnoreFile(uri)) {
            log(`File deleted: ${uri.fsPath}`);
            updateFileListing();
        }
    });

    // Remove or disable the change handler since we don't want to update on content changes
    // Instead, just log the event but don't trigger an update
    fileSystemWatcher.onDidChange((uri) => {
        if (currentState === WatchState.Auto && !shouldIgnoreFile(uri)) {
            log(`File content changed (ignoring): ${uri.fsPath}`);
            // No updateFileListing() call here
        }
    });

    return fileSystemWatcher;
}

// Update deactivate to handle both status bar items
export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (refreshStatusBarItem) {
        refreshStatusBarItem.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
    if (fileWatcher) {
        fileWatcher.dispose();
    }
}
