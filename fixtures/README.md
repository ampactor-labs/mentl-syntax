# Fixture sources

The editor preview uses `examples/grid/station.mn`, copied byte-for-byte from
Mentl's `examples/grid/station.mn`. Other full-file fixtures are copied from
Mentl's `examples/hello/five.mn`, `examples/pulse/course/08-hole.mn`,
`examples/pulse/course/10-voices.mn`, and `lib/strings.mn`.

Focused lexical fixtures are also copied verbatim from Mentl's existing
materials: `edge/numeric-base-literals.mn` comes from
`tests/syntax/numeric-base-literals.mn`; `edge/multiline-string.mn` is the
triple-quoted example in `docs/SYNTAX.md` § Strings. There is no triple-quoted
string in the current `lib/` or `examples/` corpus, so that one syntax example
is the source for the required multiline edge case.
