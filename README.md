# Mentl Language Support

This repository provides editor recognition and syntax highlighting for
Mentl's `.mn` files. The language ID is `mentl`, the MIME type is
`text/vnd.ampactor.mentl`, and the TextMate root scope is `source.mentl`.

## VS Code

Build a local extension package and install the resulting VSIX:

```sh
npm install
npm run package:vsix
code --install-extension mentl-syntax-0.1.0.vsix
```

The extension contributes the canonical TextMate grammar, two-space editor
indentation, and the Mentl Obsidian and Mentl Parchment themes.

## Shiki fixture preview

```sh
npm run dev
```

Open the local Vite page to see `fixtures/examples/grid/station.mn` highlighted
with the same grammar and theme JSON files that ship in the extension. The
page displays both themes side by side.

## Verification

```sh
npm run verify:grammar
npm run build:fixtures
npm run package:vsix
```

See [fixtures/README.md](fixtures/README.md) for source provenance and
[docs/token-comparison.md](docs/token-comparison.md) for the role-by-role
comparison with Mentl Space, including the named TextMate gaps.
