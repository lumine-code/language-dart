// Assertions live in the comments: `<- scope` checks the marker's own column
// on the previous non-comment line, `^ scope` checks the caret's. Scopes
// match by prefix, so the trailing `.dart` segment is left off.

void main() {
//       ^ punctuation.definition.arguments.begin.bracket.round
//          ^ punctuation.definition.block.begin.bracket.curly

  var name = "world";
//            ^ string
//                  ^ punctuation.terminator.statement

}
// <- punctuation.definition.block.end.bracket.curly

// a comment
// <- comment
