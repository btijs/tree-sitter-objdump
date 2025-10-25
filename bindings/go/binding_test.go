package tree_sitter_objdump_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_objdump "github.com/tree-sitter/tree-sitter-objdump/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_objdump.Language())
	if language == nil {
		t.Errorf("Error loading objdump grammar")
	}
}
