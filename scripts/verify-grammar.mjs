import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHighlighter } from 'shiki'

const root = new URL('../', import.meta.url)
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))
const grammar = await readJson('mentl.tmLanguage.json')
const packageJson = await readJson('package.json')
const languageConfiguration = await readJson('language-configuration.json')
const obsidian = await readJson('themes/obsidian-color-theme.json')
const parchment = await readJson('themes/parchment-color-theme.json')

assert.equal(grammar.scopeName, 'source.mentl')
assert.equal(packageJson.contributes.languages[0].id, 'mentl')
assert.deepEqual(packageJson.contributes.languages[0].extensions, ['.mn'])
assert.equal(languageConfiguration.comments.lineComment, '//')
assert.deepEqual(languageConfiguration.brackets, [['{', '}'], ['[', ']'], ['(', ')']])
assert.equal(packageJson.contributes.configurationDefaults['[mentl]']['editor.tabSize'], 2)
assert.equal(packageJson.contributes.configurationDefaults['[mentl]']['editor.insertSpaces'], true)

const roles = [
  { id: 'tk-kw', scope: 'keyword.declaration.mentl', file: 'fixtures/examples/grid/station.mn', text: 'fn', dark: '#5FB0DC', light: '#004F82' },
  { id: 'tk-verb', scope: 'keyword.operator.pipe.mentl', file: 'fixtures/examples/grid/station.mn', text: '<~', dark: '#7CC8EE', light: '#166A96' },
  { id: 'tk-ty', scope: 'entity.name.type.mentl', file: 'fixtures/examples/grid/station.mn', text: 'SpinW', dark: '#F0B830', light: '#7E5600' },
  { id: 'tk-fn', scope: 'entity.name.function.mentl', file: 'fixtures/examples/grid/station.mn', text: 'clamp_spin', dark: '#33B893', light: '#00634A' },
  { id: 'tk-num', scope: 'constant.numeric.mentl', file: 'fixtures/examples/grid/station.mn', text: '9400000', dark: '#E87D44', light: '#A04500' },
  { id: 'tk-hole', scope: 'keyword.operator.hole.mentl', file: 'fixtures/examples/pulse/course/08-hole.mn', text: '??', dark: '#E87D44', light: '#A04500' },
  { id: 'tk-disc', scope: 'keyword.other.discipline.mentl', file: 'fixtures/examples/grid/station.mn', text: 'Pure', dark: '#D9A0C0', light: '#873F72' },
  { id: 'tk-str', scope: 'string.quoted.double.mentl', file: 'fixtures/examples/grid/station.mn', text: 'within 36 mHz of 60;', partial: true, dark: '#F0C674', light: '#7A5C00' },
]
const blueKeywords = ['fn', 'let', 'if', 'else', 'match', 'type', 'effect', 'handler', 'with', 'import', 'where', 'true', 'false']
const disciplineKeywords = [
  { file: 'fixtures/lib/strings.mn', text: 'own' },
  { file: 'fixtures/lib/strings.mn', text: 'ref' },
  { file: 'fixtures/examples/grid/station.mn', text: 'resume' },
]
const verbOperators = ['|>', '<|', '><', '~>', '<~']

const fixturePaths = [
  'fixtures/examples/grid/station.mn',
  'fixtures/examples/hello/five.mn',
  'fixtures/examples/pulse/course/08-hole.mn',
  'fixtures/examples/pulse/course/10-voices.mn',
  'fixtures/lib/strings.mn',
  'fixtures/edge/numeric-base-literals.mn',
  'fixtures/edge/multiline-string.mn',
]
const fixtureText = new Map(await Promise.all(fixturePaths.map(async (path) => [path, await readFile(new URL(path, root), 'utf8')])))
const allFixtures = [...fixtureText.values()].join('\n')
const highlighter = await createHighlighter({
  langs: [{ ...grammar, name: 'mentl', aliases: ['Mentl', 'mn'] }],
  themes: [obsidian, parchment],
})

const flattenTokens = (lines) => lines.flat()
const tokenScopeNames = (token) => {
  const explanation = token.explanation ?? []
  return explanation.flatMap((item) => item.scopes ?? []).map((scope) => typeof scope === 'string' ? scope : scope.scopeName ?? scope.scope ?? '')
}
const checkRole = async (theme, role, expectedColor) => {
  const source = fixtureText.get(role.file)
  const result = highlighter.codeToTokens(source, {
    lang: 'mentl',
    theme: theme.name,
    includeExplanation: true,
  })
  const candidates = flattenTokens(result.tokens).filter((token) => role.partial ? token.content.includes(role.text) : token.content.trim() === role.text)
  const candidate = candidates.find((token) => token.color?.toLowerCase() === expectedColor.toLowerCase() && tokenScopeNames(token).includes(role.scope))
  assert(candidate, `${role.id}: expected ${JSON.stringify(role.text)} with scope ${role.scope} and color ${expectedColor} in ${role.file}; candidates: ${candidates.map((token) => `${token.color} [${tokenScopeNames(token).join(', ')}]`).join('; ')}`)
  return { role: role.id, witness: role.text, scope: role.scope, color: candidate.color }
}

const reportRows = []
for (const [theme, colorKey] of [[obsidian, 'dark'], [parchment, 'light']]) {
  for (const role of roles) {
    reportRows.push(await checkRole(theme, role, role[colorKey]))
  }
}

for (const [theme, expected] of [[obsidian, '#5FB0DC'], [parchment, '#004F82']]) {
  const tokens = flattenTokens(highlighter.codeToTokens(allFixtures, {
    lang: 'mentl',
    theme: theme.name,
    includeExplanation: true,
  }).tokens)
  for (const word of blueKeywords) {
    const token = tokens.find((item) => item.content.trim() === word && tokenScopeNames(item).some((scope) => scope === 'keyword.control.mentl' || scope === 'keyword.declaration.mentl'))
    assert(token, `${theme.name}: keyword ${word} did not receive a keyword scope`)
    assert.equal(token.color?.toLowerCase(), expected.toLowerCase(), `${theme.name}: keyword ${word} has the wrong color`)
  }
  for (const discipline of disciplineKeywords) {
    const source = fixtureText.get(discipline.file)
    const disciplineTokens = flattenTokens(highlighter.codeToTokens(source, {
      lang: 'mentl',
      theme: theme.name,
      includeExplanation: true,
    }).tokens)
    const token = disciplineTokens.find((item) => item.content.trim() === discipline.text && tokenScopeNames(item).includes('keyword.other.discipline.mentl'))
    assert(token, `${theme.name}: discipline keyword ${discipline.text} did not receive a discipline scope`)
    assert.equal(token.color?.toLowerCase(), (theme === obsidian ? '#D9A0C0' : '#873F72').toLowerCase(), `${theme.name}: discipline keyword ${discipline.text} has the wrong color`)
  }
  const verbTokens = flattenTokens(highlighter.codeToTokens(fixtureText.get('fixtures/examples/hello/five.mn'), {
    lang: 'mentl',
    theme: theme.name,
    includeExplanation: true,
  }).tokens)
  for (const operator of verbOperators) {
    const token = verbTokens.find((item) => item.content.trim() === operator && tokenScopeNames(item).includes('keyword.operator.pipe.mentl'))
    assert(token, `${theme.name}: verb operator ${operator} did not receive a verb scope`)
    assert.equal(token.color?.toLowerCase(), (theme === obsidian ? '#7CC8EE' : '#166A96').toLowerCase(), `${theme.name}: verb operator ${operator} has the wrong color`)
  }
}

for (const [theme, expected] of [[obsidian, '#E87D44'], [parchment, '#A04500']]) {
  const stationTokens = flattenTokens(highlighter.codeToTokens(fixtureText.get('fixtures/examples/grid/station.mn'), {
    lang: 'mentl',
    theme: theme.name,
    includeExplanation: true,
  }).tokens)
  const negation = stationTokens.find((token) => token.content.trim() === '!Alloc' && tokenScopeNames(token).includes('keyword.operator.negation.mentl'))
  assert(negation, `${theme.name}: nominal effect negation !Alloc was not scoped as tk-neg`)
  assert.equal(negation.color?.toLowerCase(), expected.toLowerCase(), `${theme.name}: nominal effect negation color mismatch`)
}

for (const theme of [obsidian, parchment]) {
  const html = highlighter.codeToHtml(fixtureText.get('fixtures/examples/grid/station.mn'), {
    lang: 'mentl',
    theme: theme.name,
  })
  assert(html.includes('shiki'), `${theme.name}: Shiki did not return a highlighted block`)
  assert(html.toLowerCase().includes(theme.colors['editor.background'].toLowerCase()), `${theme.name}: rendered block lacks its editor background`)
  assert(html.includes('station'), `${theme.name}: rendered fixture source is missing`)
}

const numberFixture = fixtureText.get('fixtures/edge/numeric-base-literals.mn')
const numberTokens = flattenTokens(highlighter.codeToTokens(numberFixture, { lang: 'mentl', theme: obsidian.name }).tokens)
for (const literal of ['0b1_011', '0o17', '0x2A', '2_3']) {
  assert(numberTokens.some((token) => token.content.trim() === literal && token.color?.toLowerCase() === '#e87d44'), `numeric fixture: ${literal} did not receive tk-num color`)
}
const floatTokens = flattenTokens(highlighter.codeToTokens(fixtureText.get('fixtures/examples/pulse/course/08-hole.mn'), { lang: 'mentl', theme: obsidian.name }).tokens)
assert(floatTokens.some((token) => token.content.trim() === '0.3' && token.color?.toLowerCase() === '#e87d44'), 'real example fixture: decimal float did not receive tk-num color')

const stringFixture = fixtureText.get('fixtures/edge/multiline-string.mn')
const stringTokens = flattenTokens(highlighter.codeToTokens(stringFixture, { lang: 'mentl', theme: obsidian.name }).tokens)
assert(stringTokens.some((token) => token.content.includes('Hello, ') && token.color?.toLowerCase() === '#f0c674'), 'multiline fixture: literal chunk did not receive tk-str color')
assert(stringTokens.some((token) => token.content.trim() === 'name'), 'multiline fixture: interpolation expression was not tokenized')
const stringTokensWithScopes = flattenTokens(highlighter.codeToTokens(stringFixture, {
  lang: 'mentl',
  theme: obsidian.name,
  includeExplanation: true,
}).tokens)
assert(stringTokensWithScopes.some((token) => token.content.trim() === '{' && token.color?.toLowerCase() === '#f5ede0' && tokenScopeNames(token).includes('punctuation.section.embedded.begin.mentl')), 'multiline fixture: splice opener did not receive tk-spl color')
assert(stringTokensWithScopes.some((token) => token.content.trim() === '}' && token.color?.toLowerCase() === '#e8dcc8' && tokenScopeNames(token).includes('punctuation.section.embedded.end.mentl')), 'multiline fixture: splice closer should retain ordinary foreground color')

highlighter.dispose()

const roleReport = ['# Verification output', '', `- Shiki dependency range: ${packageJson.devDependencies.shiki}`, `- Language ID: ${packageJson.contributes.languages[0].id}; extension: ${packageJson.contributes.languages[0].extensions.join(', ')}`, '- Same preview source rendered with both extension theme JSON files: `fixtures/examples/grid/station.mn`', '- Edge fixtures: binary, octal, hexadecimal, decimal separators, multiline strings, and interpolation', '', '| Theme | Role | Witness | TextMate scope | Color |', '| --- | --- | --- | --- | --- |', ...reportRows.map((row, index) => `| ${index < roles.length ? 'Obsidian' : 'Parchment'} | ${row.role} | \`${row.witness}\` | \`${row.scope}\` | \`${row.color}\` |`), '', 'The Shiki renderer loaded `mentl.tmLanguage.json` and the two theme JSON files directly. See `token-comparison.md` for the Mentl Space class mapping and named TextMate gaps.'].join('\n')
await writeFile(new URL('../docs/verification-results.md', import.meta.url), `${roleReport}\n`)

console.log(`Verified ${roles.length} Mentl Space token roles in both themes (${reportRows.length} scope/color checks).`)
console.log(`Verified all ${blueKeywords.length} blue keywords, four discipline annotations, all five verb operators, and a decimal float.`)
console.log('Verified the same station.mn fixture renders in Obsidian and Parchment.')
console.log('Verified numeric base/separator forms and multiline interpolation.')
console.log('Wrote docs/verification-results.md.')
