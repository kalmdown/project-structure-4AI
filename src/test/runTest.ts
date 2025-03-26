// src\test\runTest.ts
import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test runner script
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the tests
    await runTests({ 
      extensionDevelopmentPath, 
      extensionTestsPath,
      // The key is to use a proper workspace file
      launchArgs: [
        path.resolve(__dirname, '../../test-workspace.code-workspace')
      ]
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
