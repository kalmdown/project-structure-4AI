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
    console.log('Root path:', rootPath);
    
    const fileListingPath = path.join(rootPath, '.vscode', 'project-files.md');
    console.log('File listing path:', fileListingPath);

    try {
        // Ensure .vscode directory exists
        const vscodePath = path.join(rootPath, '.vscode');
        if (!fs.existsSync(vscodePath)) {
            console.log('Creating .vscode directory');
            fs.mkdirSync(vscodePath);
        }

        const config = vscode.workspace.getConfiguration('projectFiles');
        const excludeDirs = config.get<string[]>('excludeDirectories') || ['.git', 'node_modules'];

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
                
                // Skip excluded directories
                if (stats.isDirectory() && excludeDirs.includes(file)) {
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
        return filePath.endsWith('project-files.md');
    };
    
    fileSystemWatcher.onDidCreate((uri) => {
        if (currentState === WatchState.Auto && !shouldIgnoreFile(uri)) {
            log(`File created: ${uri.fsPath}`);
            updateFileListing();
        }
    });

    fileSystemWatcher.onDidDelete((uri) => {
        if (currentState === WatchState.Auto && !shouldIgnoreFile(uri)) {
            log(`File deleted: ${uri.fsPath}`);
            updateFileListing();
        }
    });

    fileSystemWatcher.onDidChange((uri) => {
        if (currentState === WatchState.Auto && !shouldIgnoreFile(uri)) {
            log(`File changed: ${uri.fsPath}`);
            updateFileListing();
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
