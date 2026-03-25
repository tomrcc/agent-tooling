import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const siteName = process.argv[2];
const repoUrl = process.argv[3];

if (!siteName || !repoUrl) {
	console.error('Usage: node add-test-site.mjs <name> <repo-url>');
	process.exit(1);
}

const baseDir = `templates/${siteName}`;
const pristineDir = `${baseDir}/pristine`;
const migratedDir = `${baseDir}/migrated`;

if (existsSync(baseDir)) {
	console.error(`Template "${siteName}" already exists at ${baseDir}`);
	process.exit(1);
}

mkdirSync(baseDir, { recursive: true });

console.log(`Cloning ${repoUrl} into ${pristineDir}`);
execSync(`git clone ${repoUrl} ${pristineDir}`, { stdio: 'inherit' });

execSync(`rm -rf ${pristineDir}/.git`);

console.log(`Copying pristine/ to migrated/`);
execSync(`cp -r ${pristineDir} ${migratedDir}`, { stdio: 'inherit' });

console.log(`Done — template "${siteName}" is ready.`);
