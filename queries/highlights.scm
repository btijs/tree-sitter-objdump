; Addresses (e.g. function or instruction addresses)
(address) @number

; Function labels like <main>
(function_header
  label: (_) @function)

; Mnemonics (e.g. mov, vmov, add)
(mnemonic) @function.macro

; Registers (e.g. r5, d8)
(register) @variable.builtin

; Immediate values like #42
(immediate) @constant

; Bytes and words
(bytes) @string.special
(word) @string.special

; Inline or full-line comments
; (comment) @comment
(inline_comment) @comment

; Section headers
(section_header) @namespace
(section_name) @namespace

; Branch addresses' labels
(branch_address
  label: (_) @label)
