# Verification output

- Shiki dependency range: ^4.5.0
- Language ID: mentl; extension: .mn
- Same preview source rendered with both extension theme JSON files: `fixtures/examples/grid/station.mn`
- Edge fixtures: binary, octal, hexadecimal, decimal separators, multiline strings, and interpolation

| Theme | Role | Witness | TextMate scope | Color |
| --- | --- | --- | --- | --- |
| Obsidian | tk-kw | `fn` | `keyword.declaration.mentl` | `#5FB0DC` |
| Obsidian | tk-verb | `<~` | `keyword.operator.pipe.mentl` | `#7CC8EE` |
| Obsidian | tk-ty | `SpinW` | `entity.name.type.mentl` | `#F0B830` |
| Obsidian | tk-fn | `clamp_spin` | `entity.name.function.mentl` | `#33B893` |
| Obsidian | tk-num | `9400000` | `constant.numeric.mentl` | `#E87D44` |
| Obsidian | tk-hole | `??` | `keyword.operator.hole.mentl` | `#E87D44` |
| Obsidian | tk-disc | `Pure` | `keyword.other.discipline.mentl` | `#D9A0C0` |
| Obsidian | tk-str | `within 36 mHz of 60;` | `string.quoted.double.mentl` | `#F0C674` |
| Parchment | tk-kw | `fn` | `keyword.declaration.mentl` | `#004F82` |
| Parchment | tk-verb | `<~` | `keyword.operator.pipe.mentl` | `#166A96` |
| Parchment | tk-ty | `SpinW` | `entity.name.type.mentl` | `#7E5600` |
| Parchment | tk-fn | `clamp_spin` | `entity.name.function.mentl` | `#00634A` |
| Parchment | tk-num | `9400000` | `constant.numeric.mentl` | `#A04500` |
| Parchment | tk-hole | `??` | `keyword.operator.hole.mentl` | `#A04500` |
| Parchment | tk-disc | `Pure` | `keyword.other.discipline.mentl` | `#873F72` |
| Parchment | tk-str | `within 36 mHz of 60;` | `string.quoted.double.mentl` | `#7A5C00` |

The Shiki renderer loaded `mentl.tmLanguage.json` and the two theme JSON files directly. See `token-comparison.md` for the Mentl Space class mapping and named TextMate gaps.
