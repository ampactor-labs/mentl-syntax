# Mentl Space token class comparison

Mentl Space assigns classes in `src/space.mn` and colors them in
`ide/index.html` using `ide/tokens.css`. These scopes in the canonical
TextMate grammar carry the same class colors:

| Mentl Space class | TextMate scope | Obsidian | Parchment |
| --- | --- | --- | --- |
| `tk-kw` | `keyword.control.mentl`, `keyword.declaration.mentl` | `#5FB0DC` | `#004F82` |
| `tk-verb` | `keyword.operator.pipe.mentl` | `#7CC8EE` | `#166A96` |
| `tk-ty` | `entity.name.type.mentl` | `#F0B830` | `#7E5600` |
| `tk-fn` | `entity.name.function.mentl` | `#33B893` | `#00634A` |
| `tk-num` | `constant.numeric.mentl` | `#E87D44` | `#A04500` |
| `tk-hole` | `keyword.operator.hole.mentl` | `#E87D44` | `#A04500` |
| `tk-disc` | `keyword.other.discipline.mentl` | `#D9A0C0` | `#873F72` |
| `tk-str` | `string.quoted.double.mentl`, `string.quoted.multi.mentl` | `#F0C674` | `#7A5C00` |

Interpolation's opening `{` also matches Mentl Space's `tk-spl` color
(`#F5EDE0` / `#000000`). Its closing `}` is ordinary punctuation in the
lexer, so it keeps the editor foreground. A nominal effect negation such as
`!Alloc` scopes the bang and name with the boundary color.

The preview renders the same real `station.mn` file side by side with both
theme JSON files. The verification script tokenizes the copied fixture corpus
with the same grammar and checks that each of the eight mapped role colors is
present in both themes. `tk-hole` is exercised by `examples/pulse/course/08-hole.mn`;
the station preview itself has no active hole.

The source palette contains a light value for every role used by Parchment.
Obsidian and Parchment values are copied from the corresponding dark and light
tokens in `ide/tokens.css`; no role color was inferred or invented.

## Named TextMate gaps

- **Triple-string indentation projection:** the grammar recognizes multiline
  strings and their interpolations, but TextMate cannot strip the common
  indentation that the lexer removes from a triple-quoted string's value.
- **String value construction:** the grammar scopes interpolation expressions
  and escape spellings. It does not evaluate those expressions or decode
  escapes into the lexer's `TStringPart` payloads.
- **Lexer diagnostics and recovery:** the grammar does not issue the lexer's
  malformed-base, alphanumeric-run-on, or raw-newline-in-single-line-string
  diagnostics, nor can it expose the lexer's recovery position.
- **Typed token stream:** TextMate provides lexical scopes; it does not expose
  Mentl's `TokenKind` values, spans, or `CanvasToken` results to editor clients.
