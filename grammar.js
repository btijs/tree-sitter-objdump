/**
 * @file Syntax for objdump output
 * @author Tijs Bellefroid
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "objdump",

  extras: ($) => [],

  conflicts: ($) => [],

  rules: {
    source_file: ($) =>
      seq(
        "\n",
        field("filename", /[^\n]*\n/),
        "\n",
        "\n",
        repeat($.section), //
      ),

    section: ($) =>
      seq(
        $.section_header, // e.g. Disassembly of section .text:
        "\n",
        repeat($.function), //
      ),

    section_header: ($) =>
      seq(
        "Disassembly of section ",
        field("section_name", $.section_name), // e.g. .text
        ":\n",
      ),

    section_name: ($) => /\.[A-Za-z0-9_.@\$+\-<>]+/,

    function: ($) =>
      prec.right(
        seq(
          $.function_header, // e.g. 0000000000001139 <main>:
          repeat1(
            choice(
              $.instruction_line, // e.g. c000246:	4625      	mov	r5, r4
              "\t...\n",
            ),
          ),
          "\n",
        ),
      ),

    function_header: ($) => seq(field("address", $.address), " ", field("label", $.label), ":", "\n"),

    instruction_line: ($) =>
      seq(
        " ",
        field("address", $.address),
        ":\t",
        choice(
          // Data word
          seq(field("raw_data", $.raw_word), ".word", "\t", field("data_value", $.word)),
          // Data short (half word)
          seq(field("raw_data", $.raw_short), ".short", "\t", field("data_value", $.short)),
          // Data byte
          seq(field("raw_data", $.raw_byte), ".byte", "\t", field("data_value", $.byte)),

          // Instruction
          seq(field("raw_data", $.raw_instr), prec.right(field("mnemonic", $.mnemonic)), optional(seq("\t", field("operands", $.operands)))),

          // Weird instruction with lots of spaces
          seq(field("raw_data", $.raw_weird_instr), /[0-9a-zA-Z\.]{4}/),
        ),
        optional(seq("\t", $.inline_comment)),
        "\n",
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
          seq($.register_offset, "!"), // e.g. sp!
        ),
      ),
    register: ($) => choice(/(r|s|d)[0-9]{1,2}/, /[a-zA-Z\_]+/),
    register_set: ($) =>
      seq(
        "{",
        commaSep1(choice($.register, seq($.register, "-", $.register))), // e.g. {r4, r5, r6-r8}
        "}",
      ),
    register_offset: ($) => seq("[", commaSep1(choice($.register, $.immediate)), "]"),
    immediate: ($) =>
      seq(
        optional(seq(choice("lsl", "lsr", "asr"), " ")), // e.g. lsl #2
        choice("#", "0x"),
        optional("-"),
        /\d+/, // e.g. #42 or 0x42
      ),

    inline_comment: ($) => seq("@", /[^\n]*/),

    address: ($) => /[0-9a-fA-F]{4,20}/,
    raw_word: ($) => seq(/[0-9a-fA-F]{8}/, " \t"), // e.g. fbb2fcf1
    raw_byte: ($) => seq(/[0-9a-fA-F]{2}/, "          ", optional("\t")), // e.g. 4a
    raw_short: ($) => seq(/[0-9a-fA-F]{4}/, "      \t"), // e.g. 0d0d
    raw_instr: ($) =>
      choice(
        seq(/[0-9a-fA-F]{4}/, " ", /[0-9a-fA-F]{4}/, " \t"), // e.g. e8df f003
        $.raw_short, // e.g. 4625
      ),
    raw_weird_instr: ($) => seq(/[0-9a-fA-F]{4}/, " ", /[0-9a-fA-F]{4}/, "                                   "), // e.g. e8df f003
    word: ($) => seq("0x", /[0-9a-fA-F]{8}/),
    short: ($) => seq("0x", /[0-9a-fA-F]{4}/),
    byte: ($) => seq("0x", /[0-9a-fA-F]{2}/),
    mnemonic: ($) => /[A-Za-z][A-Za-z\.]*/,
    hex_number: ($) => seq("0x", /[a-fA-F0-9]+/),
    label: ($) =>
      seq(
        "<", //
        field("label_name", $.label_name),
        optional(seq("+", field("offset", $.hex_number))),
        ">",
      ),
    label_name: ($) => /[a-zA-Z0-9\_\.]+/,
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(", ", rule)));
}
