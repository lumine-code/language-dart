
(class_definition
  name: (identifier) @name) @definition.class

(method_signature
  (function_signature)) @definition.method

(type_alias
  (type_identifier) @name) @definition.type

(method_signature
(getter_signature
  name: (identifier) @name)) @definition.method

(method_signature
(setter_signature
  name: (identifier) @name)) @definition.method 

(method_signature
  (function_signature
  name: (identifier) @name)) @definition.method

(method_signature
  (factory_constructor_signature
    (identifier) @name)) @definition.method

(method_signature
  (constructor_signature
  name: (identifier) @name)) @definition.method

(method_signature
  (operator_signature)) @definition.method

(method_signature) @definition.method

(mixin_declaration
  (mixin)
  (identifier) @name) @definition.mixin

(extension_declaration
  name: (identifier) @name) @definition.extension


(new_expression
  (type_identifier) @name) @reference.class

(enum_declaration
  name: (identifier) @name) @definition.enum

(function_signature
  name: (identifier) @name) @definition.function 

; Dart flattens call chains into sibling selectors. Match the called leaf
; against its immediate argument selector instead of repeating the chain.
((identifier) @name @reference.call
  (#is? test.typeAt "nextNamedSibling.firstNamedChild argument_part"))

; A nullable function can be invoked after one non-null assertion selector.
((identifier) @name @reference.call
  (#is? test.textAt "nextNamedSibling !")
  (#is? test.typeAt "nextNamedSibling.nextNamedSibling.firstNamedChild argument_part"))

([
  (unconditional_assignable_selector (identifier) @name @reference.call)
  (conditional_assignable_selector (identifier) @name @reference.call)
]
  (#is? test.typeAt "parent.parent.nextNamedSibling.firstNamedChild argument_part"))

([
  (unconditional_assignable_selector (identifier) @name @reference.call)
  (conditional_assignable_selector (identifier) @name @reference.call)
]
  (#is? test.textAt "parent.parent.nextNamedSibling !")
  (#is? test.typeAt "parent.parent.nextNamedSibling.nextNamedSibling.firstNamedChild argument_part"))

((cascade_selector (identifier) @name @reference.call)
  (#is? test.typeAt "parent.nextNamedSibling argument_part"))
