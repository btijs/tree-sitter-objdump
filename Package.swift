// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterObjdump",
    products: [
        .library(name: "TreeSitterObjdump", targets: ["TreeSitterObjdump"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterObjdump",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterObjdumpTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterObjdump",
            ],
            path: "bindings/swift/TreeSitterObjdumpTests"
        )
    ],
    cLanguageStandard: .c11
)
