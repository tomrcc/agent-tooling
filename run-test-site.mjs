import { execSync } from 'node:child_process';

const siteName = process.argv[2];
const cwd = `templates/${siteName}/migrated`;

console.log(`Installing dependencies in ${cwd}`);
execSync('npm i --legacy-peer-deps', { cwd, stdio: 'inherit' });

console.log(`Running a build`);
execSync('npm run build', { cwd, stdio: 'inherit' });

console.log(`Starting fog machine on built dir`);
execSync('~/Desktop/tooling/fog_machine dist', { cwd, stdio: 'inherit' });
