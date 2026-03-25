import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const siteName = process.argv[2];
const cwd = `templates/${siteName}/migrated`;

function detectPackageManager(dir) {
	if (existsSync(`${dir}/pnpm-lock.yaml`)) return 'pnpm';
	if (existsSync(`${dir}/yarn.lock`)) return 'yarn';
	return 'npm';
}

const pm = detectPackageManager(cwd);

console.log(`Installing dependencies in ${cwd} using ${pm}`);
execSync(`${pm} install`, { cwd, stdio: 'inherit' });

console.log(`Running a build`);
execSync(`${pm} run build`, { cwd, stdio: 'inherit' });

console.log(`Starting fog machine on built dir`);
execSync('~/Desktop/tooling/fog_machine dist', { cwd, stdio: 'inherit' });
