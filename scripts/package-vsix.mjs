import { cp, mkdir, mkdtemp, readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const staging = await mkdtemp(join(tmpdir(), 'mentl-syntax-vsix-'))
const files = [
  'package.json',
  'README.md',
  'LICENSE',
  'LICENSE-MIT',
  'LICENSE-APACHE',
  'language-configuration.json',
  'mentl.tmLanguage.json',
  'themes',
  'docs/token-comparison.md',
  'fixtures/README.md',
]

for (const path of files) {
  const source = join(root, path)
  const destination = join(staging, path)
  await mkdir(dirname(destination), { recursive: true })
  await cp(source, destination, { recursive: true })
}

const output = join(root, `${manifest.name}-${manifest.version}.vsix`)
const vsce = join(root, 'node_modules/.bin/vsce')
execFileSync(vsce, ['package', '--no-yarn', '--no-dependencies', '--out', output], {
  cwd: staging,
  env: { ...process.env, npm_config_cache: join(tmpdir(), 'mentl-syntax-npm-cache') },
  stdio: 'inherit',
})
console.log(`Packaged ${basename(output)} from ${files.length} extension source entries.`)
