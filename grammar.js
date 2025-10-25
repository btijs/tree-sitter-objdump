/**
 * @file Syntax for objdump output
 * @author Tijs Bellefroid
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "objdump",

  extras: ($) => [/\s/],

  conflicts: ($) => [],

  rules: {
    source_file: ($) => repeat($.section),

    // blank: ($) => /\n/,

    section: ($) =>
      seq(
        $.section_header, // e.g. Disassembly of section .text:
        // optional(repeat($.blank)),
        repeat($.function), //
      ),

    section_header: ($) =>
      seq(
        "Disassembly of section ",
        field("section_name", /\.[A-Za-z0-9_.@\$+\-<>]+/), // e.g. .text
        ":",
      ),

    function: ($) =>
      prec.right(
        seq(
          $.function_header, // e.g. 0000000000001139 <main>:
          repeat1($.instruction_line), // e.g. c000246:	4625      	mov	r5, r4
          optional("..."),
        ),
      ),

    function_header: ($) =>
      seq(
        field("address", $.address),
        optional(":"), // sometimes printed with colon
        /\s*/,
        field("label", $.label),
        ":",
      ),

    instruction_line: ($) =>
      seq(
        " ",
        field("address", $.address),
        ":",
        choice(
          // Instruction
          seq(
            field("bytes", prec.right($.bytes)), //
            field("mnemonic", $.mnemonic),
            optional(field("operands", $.operands)),
          ),
          // Data word
          seq(
            field("raw_data", $.word), //
            ".word",
            field("data_value", $.word),
          ),
        ),
        optional($.inline_comment),
        "\n", //
      ),

    branch_address: ($) =>
      seq(
        field("address", $.address), // e.g. c000618
        " ",
        field("label", $.label), // e.g. <__acle_se_SECURE_RegisterCallback>
      ),

    operands: ($) =>
      commaSep1(
        choice(
          $.branch_address,
          $.immediate,
          $.register,
          $.register_set,
          $.register_offset,
          seq($.register, "!"), // e.g. sp!
        ),
      ),
    register: ($) => choice(/(r|s|d)[0-9]{1,2}/, /[a-zA-Z\_]+/),
    register_set: ($) =>
      seq(
        "{",
        repeat(choice($.register, ",", "-")), // e.g. {r4, r5, r6-r8}
        "}",
      ),
    register_offset: ($) => seq("[", commaSep1(choice($.register, $.immediate)), "]"),
    immediate: ($) =>
      seq(
        optional("lsl"), // e.g. lsl #2
        choice("#", "0x"),
        /\d+/, // e.g. #42 or 0x42
      ),

    inline_comment: ($) => seq("@", /.*/),

    address: ($) => /[0-9a-fA-F]{4,50}/,
    bytes: ($) => repeat1(seq(/[0-9a-fA-F]{4}/, /\s/)),
    word: ($) => seq(optional("0x"), /[0-9a-fA-F]{8}/),
    mnemonic: ($) => /[A-Za-z][A-Za-z0-9\.\_]*/,
    label: ($) => /<[^>]+>/,
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
