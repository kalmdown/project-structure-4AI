// src\test\routeDetection.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Import the extension API
import * as myExtension from '../extension';
const api = (myExtension as any).getTestAPI?.() || {};

interface RouteInfo {
  method: string;
  path: string;
  framework: string;
  handler?: string;
  params?: string[];
}

suite('Framework Route Detection', () => {
  const testWorkspacePath = path.join(__dirname, '../../test-workspace');
  const structureFilePath = path.join(testWorkspacePath, '.vscode', 'project-structure.md');
  
  suiteSetup(async function() {
    this.timeout(5000);
    
    // Create test files
    if (!fs.existsSync(path.join(testWorkspacePath, '.vscode'))) {
      fs.mkdirSync(path.join(testWorkspacePath, '.vscode'), { recursive: true });
    }
    
    // Create a simple express file
    const expressFilePath = path.join(testWorkspacePath, 'express-simple.js');
    fs.writeFileSync(expressFilePath, `
      const express = require('express');
      const app = express();
      app.get('/about', function aboutHandler(req, res) { res.send('About'); });
      module.exports = app;
    `);
  });
  
  test('Framework information should be included in Markdown output', async function() {
    this.timeout(5000);
    
    // Manually run the update function using our API
    await api.updateFileListing();
    
    // Read the generated structure file
    assert.ok(fs.existsSync(structureFilePath), 'Structure file should exist');
    const content = fs.readFileSync(structureFilePath, 'utf8');
    
    console.log('--- FRAMEWORK TEST - FILE CONTENT ---');
    console.log(content);
    
    // Check for framework information in routes
    const expressPresent = content.includes('(Express)');
    assert.ok(expressPresent, 'Express framework information should be included');
    
    // Check entire route format
    const routePattern = /`GET \/about`.*\(Express\)/;
    assert.ok(routePattern.test(content), 'Route should include framework information');
  });
});
