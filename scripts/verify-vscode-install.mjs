import assert from 'node:assert/strict'
import { access, readFile, writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const userDataDir = resolve(process.argv[2] ?? '/tmp/mentl-vscode-user')
const extensionsDir = resolve(process.argv[3] ?? '/tmp/mentl-vscode-extensions')
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const extensionId = `${manifest.publisher}.${manifest.name}`

const installedRoot = join(extensionsDir, `${extensionId}-${manifest.version}`)
const installedManifest = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'))
assert.equal(`${installedManifest.publisher}.${installedManifest.name}`, extensionId)
assert.equal(installedManifest.version, manifest.version)
const language = installedManifest.contributes.languages.find((entry) => entry.id === 'mentl')
assert(language, 'installed extension does not contribute language ID mentl')
const fixturePath = 'fixtures/examples/grid/station.mn'
const fixtureExtension = extname(fixturePath)
assert(language.extensions.includes(fixtureExtension), `installed language contribution does not associate ${fixtureExtension}`)
assert(language.mimetypes.includes('text/vnd.ampactor.mentl'), 'installed Mentl MIME type is missing')
const grammarContribution = installedManifest.contributes.grammars.find((entry) => entry.language === 'mentl')
assert(grammarContribution, 'installed Mentl grammar contribution is missing')
const grammar = JSON.parse(await readFile(join(installedRoot, grammarContribution.path), 'utf8'))
assert.equal(grammar.scopeName, 'source.mentl')
await access(join(installedRoot, language.configuration))
assert.equal(installedManifest.contributes.themes.length, 2)

console.log(`Found ${extensionId}@${manifest.version} in the isolated VS Code extensions directory.`)
console.log(`Profile data directory: ${userDataDir}`)
console.log(`Installed language contribution maps ${fixturePath} (${fixtureExtension}; ${language.mimetypes[0]}) to language ID ${language.id}.`)
console.log(`Installed TextMate grammar scope is ${grammar.scopeName}; both themes and language configuration are present.`)

const reportPath = new URL('../docs/verification-results.md', import.meta.url)
const report = await readFile(reportPath, 'utf8')
const baseReport = report.replace(/\n## VS Code CLI install[\s\S]*$/, '')
const installResult = [
  '',
  '## VS Code CLI install',
  '',
  '- VS Code CLI installed the VSIX into isolated user data and extensions directories under `/tmp`.',
  '- CLI package listing: `' + extensionId + '@' + manifest.version + '`.',
  '- Installed language mapping: `' + fixturePath + '` -> `' + language.id + '` via `' + fixtureExtension + '` and MIME `' + language.mimetypes[0] + '`.',
  '- Installed grammar scope: `' + grammar.scopeName + '`; language configuration and both themes are present.',
].join('\n')
await writeFile(reportPath, `${baseReport.trimEnd()}\n${installResult}\n`)
