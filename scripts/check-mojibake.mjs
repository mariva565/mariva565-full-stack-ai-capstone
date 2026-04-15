#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import path from 'node:path';

const MAX_BUFFER = 20 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.html',
  '.xml',
  '.svg',
  '.sql',
  '.py',
  '.sh',
  '.ps1',
  '.toml',
  '.ini',
  '.env',
  '.example',
  '.conf',
  '.config',
]);

const TEXT_FILENAMES = new Set([
  'AGENTS.md',
  'README.md',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.env',
  '.env.example',
]);

const SUSPICIOUS_PATTERNS = [
  {
    label: 'CP1251/CP1252 pair artifact',
    re: /[\u0420\u0421][\u00A0-\u00FF]/,
  },
  {
    label: 'CP1252 quote/dash mojibake',
    re: /\u0432\u0402[\u201c\u201d\u045a\u045c\u2122\u02dc\u00a6]/,
  },
  {
    label: 'CP1252 arrow mojibake',
    re: /\u0432\u2020[\u2019\u0452\u201d]/,
  },
  {
    label: 'CP1252 checkmark/sparkle mojibake',
    re: /\u0432\u045a[\u201c\u201d\u2026\u0401]/,
  },
  {
    label: 'Double-encoded UTF-8 cascade',
    re: /\u0420\u0406\u0420/,
  },
  {
    label: 'Unicode replacement character',
    re: /\uFFFD/,
  },
];

function getStagedFiles() {
  const output = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
    { encoding: 'buffer', maxBuffer: MAX_BUFFER },
  );

  const raw = output.toString('utf8');
  if (!raw) return [];
  return raw.split('\0').filter(Boolean);
}

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  return TEXT_EXTENSIONS.has(ext) || TEXT_FILENAMES.has(base);
}

function readStagedFileFromIndex(filePath) {
  return execFileSync('git', ['show', `:${filePath}`], {
    encoding: 'buffer',
    maxBuffer: MAX_BUFFER,
  });
}

function hasNulByte(buffer) {
  return buffer.includes(0);
}

function scanContent(filePath, content) {
  const lines = content.split(/\r?\n/);
  const findings = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.re.test(line)) {
        findings.push({
          filePath,
          lineNumber: i + 1,
          label: pattern.label,
          line: line.trim(),
        });
        break;
      }
    }
  }

  return findings;
}

function formatLineForOutput(line) {
  if (!line) return '(empty line)';
  if (line.length <= 140) return line;
  return `${line.slice(0, 137)}...`;
}

function main() {
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  const allFindings = [];

  for (const filePath of stagedFiles) {
    if (!isTextFile(filePath)) {
      continue;
    }

    let buffer;
    try {
      buffer = readStagedFileFromIndex(filePath);
    } catch {
      continue;
    }

    if (hasNulByte(buffer)) {
      continue;
    }

    const text = buffer.toString('utf8');
    const findings = scanContent(filePath, text);
    allFindings.push(...findings);
  }

  if (allFindings.length === 0) {
    process.exit(0);
  }

  console.error('\n[mojibake-check] Suspicious encoding artifacts found in staged files:\n');
  for (const finding of allFindings.slice(0, 40)) {
    console.error(
      `- ${finding.filePath}:${finding.lineNumber} [${finding.label}] ${formatLineForOutput(finding.line)}`,
    );
  }

  if (allFindings.length > 40) {
    console.error(`\n...and ${allFindings.length - 40} more findings.`);
  }

  console.error(
    '\nCommit blocked. Convert the affected file(s) to UTF-8 (docs/dev-log.md => UTF-8 with BOM), then stage again.\n',
  );
  process.exit(1);
}

main();
