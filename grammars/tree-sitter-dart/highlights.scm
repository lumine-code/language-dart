; Variable
(identifier) @variable.other.dart

; Keywords
; --------------------
[
    (assert_builtin)
    (break_builtin)
    (const_builtin)
    (part_of_builtin)
    (rethrow_builtin)
    (void_type)
    "abstract"
    "as"
    "async"
    "async*"
    "await"
    "base"
    "case"
    "catch"
    "class"
    "continue"
    "covariant"
    "default"
    "deferred"
    "do"
    "else"
    "enum"
    "export"
    "extends"
    "extension"
    "external"
    "factory"
    "final"
    "finally"
    "for"
    "Function"
    "hide"
    "if"
    "implements"
    "import"
    "in"
    "interface"
    "is"
    "late"
    "library"
    "mixin"
    "new"
    "on"
    "part"
    "required"
    "return"
    "sealed"
    "show"
    "static"
    "super"
    "switch"
    "sync*"
    "throw"
    "try"
    "typedef"
    "var"
    "when"
    "while"
    "with"
    "yield"
] @keyword.control.dart

; Methods
; --------------------

; NOTE: This query is a bit of a work around for the fact that the dart grammar doesn't
; specifically identify a node as a function call
(((identifier) @entity.name.function.dart (#match? @entity.name.function.dart "^_?[a-z]"))
 . (selector . (argument_part))) @entity.name.function.dart

; Operators and Tokens
; --------------------
(template_substitution
  "$" @punctuation.definition.template-expression.begin.dart
  "{" @punctuation.definition.template-expression.begin.dart
  "}" @punctuation.definition.template-expression.end.dart)

(template_substitution
  "$" @punctuation.definition.template-expression.begin.dart
  (identifier_dollar_escaped) @variable.other.dart
) @_IGNORE_.none

(escape_sequence) @constant.character.escape.dart

[
 "@"
 "=>"
 ".."
 "??"
 "=="
 "?"
 ":"
 "&&"
 "%"
 "<"
 ">"
 "="
 ">="
 "<="
 "||"
 "~/"
 (increment_operator)
 (is_operator)
 (prefix_operator)
 (equality_operator)
 (additive_operator)
] @keyword.operator.dart

(type_arguments
  "<" @punctuation.definition.type-arguments.begin.bracket.angle.dart
  ">" @punctuation.definition.type-arguments.end.bracket.angle.dart)

(type_parameters
  "<" @punctuation.definition.type-parameters.begin.bracket.angle.dart
  ">" @punctuation.definition.type-parameters.end.bracket.angle.dart)

"(" @punctuation.definition.arguments.begin.bracket.round.dart
")" @punctuation.definition.arguments.end.bracket.round.dart
"[" @punctuation.definition.list.begin.bracket.square.dart
"]" @punctuation.definition.list.end.bracket.square.dart
"{" @punctuation.definition.block.begin.bracket.curly.dart
"}" @punctuation.definition.block.end.bracket.curly.dart

; Delimiters
; --------------------
";" @punctuation.terminator.statement.dart
"." @punctuation.separator.property.dart
"," @punctuation.separator.comma.dart

; Types
; --------------------
(type_identifier) @support.type.dart
((type_identifier) @support.type.builtin.dart
  (#match? @support.type.builtin.dart "^(int|double|String|bool|List|Set|Map|Runes|Symbol)$"))
(class_definition
  name: (identifier) @support.type.dart)
(constructor_signature
  name: (identifier) @support.type.dart)
(scoped_identifier
  scope: (identifier) @support.type.dart)
(function_signature
  name: (identifier) @entity.name.function.dart)
(getter_signature
  "get" @keyword.control.dart
  (identifier) @entity.name.function.dart)
(setter_signature
  "set" @keyword.control.dart
  name: (identifier) @entity.name.function.dart)
(operator_signature
  "operator" @keyword.control.dart)

((scoped_identifier
  scope: (identifier) @support.type.dart
  name: (identifier) @support.type.dart)
 (#match? @support.type.dart "^[a-zA-Z]"))

; Enums
; -------------------
(enum_declaration
  name: (identifier) @support.type.dart)
(enum_constant
  name: (identifier) @identifier.constant)

; Variables
; --------------------
; var keyword
(inferred_type) @keyword.control.dart

((identifier) @support.type.dart
 (#match? @support.type.dart "^_?[A-Z].*[a-z]"))

("Function" @support.type.dart)

(this) @variable.language.dart

; properties

(unconditional_assignable_selector
  (identifier) @variable.other.member.dart)

(conditional_assignable_selector
  (identifier) @variable.other.member.dart)

(cascade_section
  (cascade_selector
    (identifier) @variable.other.member.dart))

((selector
  (unconditional_assignable_selector (identifier) @entity.name.function.dart))
  (selector (argument_part (arguments)))
)

(cascade_section
  (cascade_selector (identifier) @entity.name.function.dart)
  (argument_part (arguments))
)

; assignments
(assignment_expression
  left: (assignable_expression) @variable.other.dart)

(this) @variable.language.dart

; Parameters
; --------------------
(formal_parameter
    name: (identifier) @identifier.parameter)

(named_argument
  (label (identifier) @identifier.parameter))

; Literals
; --------------------
[
    (hex_integer_literal)
    (decimal_integer_literal)
    (decimal_floating_point_literal)
    ; TODO: inaccessbile nodes
    ; (octal_integer_literal)
    ; (hex_floating_point_literal)
] @constant.numeric.dart

(string_literal) @string.quoted.double.dart
(symbol_literal (identifier) @constant.other.dart) @constant.other.dart
(true) @constant.language.boolean.dart
(false) @constant.language.boolean.dart
(null_literal) @constant.other.null.dart

(documentation_comment) @comment.line.dart
(comment) @comment.line.dart

; Annotations
; --------------------
(annotation
  "@" @entity.other.attribute-name.dart
  name: (identifier) @entity.other.attribute-name.dart)

; Modern Dart 3+ Features
; --------------------

; Extension Types
(extension_type_declaration
  "type" @keyword.control.dart)

(extension_type_declaration
  name: (identifier) @support.type.dart)

(representation_declaration
  name: (identifier) @variable.other.member.dart)

; Switch Guards ("when")
(switch_expression_case
  "when" @keyword.control.dart)

(switch_statement_case
  "when" @keyword.control.dart)

; Patterns & Pattern Matching
(object_pattern
  (identifier) @variable.other.member.dart)

(record_pattern
  (identifier) @variable.other.member.dart)

; Record Types
(record_type_field
  (identifier) @variable.other.dart)

