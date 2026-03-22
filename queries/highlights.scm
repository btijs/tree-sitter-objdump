; Addresses (e.g. function or instruction addresses)
(address) @number

; Function labels like <main>
(function_header
  label: (label
    label_name: (label_name) @function.definition))
(branch_address
  label: (label
    label_name: (label_name) @function.call))
(label
  offset: (_) @constant)

; Mnemonics (e.g. mov, vmov, add)
(mnemonic) @function.macro

; Registers (e.g. r5, d8)
(register) @variable.builtin

; Immediate values like #42
(immediate) @constant

; Bytes and words
(raw_instr) @string.special
(raw_byte) @string.special
(raw_short) @string.special
(raw_word) @string.special

(byte) @string.special
(short) @string.special
(word) @string.special

; Comments
(inline_comment) @comment

; Section headers
(section_header
  section_name: (section_name) @enum)
