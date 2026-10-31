; Recovered quotes identify literal text unless interpolation is still open.
(ERROR ["\"" "'" "\"\"\"" "'''" "r\"" "r'" "r\"\"\"" "r'''"] @match.next
  (#is? test.matchAt "parent (?:^|\\n)[^\"'\n]*\"(?:\"\")?(?:[^\"\\\\\n]|\\\\.)*(?:\\r?\\n[ \\t]*)?$|(?:^|\\n)[^\"'\n]*'(?:'')?(?:[^'\\\\\n]|\\\\.)*(?:\\r?\\n[ \\t]*)?$|(?:^|\\n)[^\"\n]*\"\"\"(?:(?!\"\"\")[^\n])*(?:\\r?\\n[ \\t]*)?$")
  (#is-not? test.matchAt "parent \\$\\{")
  (#set! indent.match startPosition))

; A recovered multiline opener and its payload remain literal data.
((ERROR (ERROR ["\"\"\"" "'''" "r\"\"\"" "r'''"])) @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

; Only explicit delimiters change indentation; incomplete expressions do not.
["{" "[" "("] @indent
["}" "]" ")"] @dedent

; Reindent code without rewriting whitespace that belongs to multiline text.
([(string_literal) (comment) (documentation_comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))
