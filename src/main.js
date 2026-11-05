import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import grammar from '../mentl.tmLanguage.json'
import obsidian from '../themes/obsidian-color-theme.json'
import parchment from '../themes/parchment-color-theme.json'
import fixture from '../fixtures/examples/grid/station.mn?raw'
import './style.css'

const status = document.querySelector('#status')

try {
  const highlighter = await createHighlighterCore({
    langs: [async () => ({ ...grammar, name: 'mentl', aliases: ['Mentl', 'mn'] })],
    themes: [obsidian, parchment],
    engine: createOnigurumaEngine(import('shiki/wasm')),
  })

  document.querySelector('#obsidian').innerHTML = highlighter.codeToHtml(fixture, {
    lang: 'mentl',
    theme: obsidian.name,
  })
  document.querySelector('#parchment').innerHTML = highlighter.codeToHtml(fixture, {
    lang: 'mentl',
    theme: parchment.name,
  })
  status.textContent = 'Rendered from the same source file, grammar, and theme JSON shipped by the extension.'
} catch (error) {
  status.textContent = `Could not render the fixture: ${error.message}`
  status.classList.add('error')
  throw error
}
