import XCTest
import SwiftTreeSitter
import TreeSitterObjdump

final class TreeSitterObjdumpTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_objdump())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading objdump grammar")
    }
}
