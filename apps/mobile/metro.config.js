const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

// Find the project and workspace roots
const projectRoot = __dirname;
// For monorepo, go up to the workspace root
const workspaceRoot = path.resolve(projectRoot, '../..');
const sharedPackageRoot = path.resolve(workspaceRoot, 'packages/shared');

const config = getDefaultConfig(projectRoot);

// 1. Watch only required workspace folders to avoid Windows watcher overload/timeouts.
config.watchFolders = fs.existsSync(sharedPackageRoot)
  ? [sharedPackageRoot]
  : [];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// 3. Force Metro to resolve (and compile) from the workspace root
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
