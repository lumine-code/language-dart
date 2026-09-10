const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const HIGHLIGHTS_PATH = path.join(__dirname, "..", "grammars", "dart-highlights.scm");

describe("Dart Tree-sitter highlights", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-dart");
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor = await lumine.workspace.open("types.dart");
    editor.setText(text);
    await editor.getBuffer().languageMode.ready;
  }

  function rawCaptures(startRow, endRow) {
    const layer = editor.getBuffer().languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
  }

  function expectLocalTile(captures) {
    expect(captures.length).toBeLessThanOrEqual(24);
    expect(
      captures.every(
        (capture) =>
          capture.node.startPosition.row >= 3000 && capture.node.startPosition.row < 3006,
      ),
    ).toBe(true);
  }

  it("keeps type arguments and parameters scoped with leaf delimiters", async () => {
    await setUp("class Box<T> {}\nBox<T> value;");

    const scopesAt = (row, text) => {
      const column = editor.lineTextForBufferRow(row).indexOf(text);
      return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
    };
    expect(scopesAt(0, "<")).toContain(
      "punctuation.definition.type-parameters.begin.bracket.angle.dart",
    );
    expect(scopesAt(0, ">")).toContain(
      "punctuation.definition.type-parameters.end.bracket.angle.dart",
    );
    expect(scopesAt(1, "<")).toContain(
      "punctuation.definition.type-arguments.begin.bracket.angle.dart",
    );
    expect(scopesAt(1, ">")).toContain(
      "punctuation.definition.type-arguments.end.bracket.angle.dart",
    );
  });

  it("keeps function-call heuristics rooted on the called identifier", async () => {
    await setUp(
      [
        "void main() {",
        "  functionCall();",
        "  object.method();",
        "  object.property.method();",
        "}",
      ].join("\n"),
    );
    const scopesAt = (row, text, occurrence = 0) => {
      const line = editor.lineTextForBufferRow(row);
      let column = -1;
      for (let index = 0; index <= occurrence; index++) column = line.indexOf(text, column + 1);
      return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
    };
    expect(scopesAt(1, "functionCall")).toContain("entity.name.function.dart");
    expect(scopesAt(2, "method")).toContain("entity.name.function.dart");
    expect(scopesAt(3, "property")).not.toContain("entity.name.function.dart");
    expect(scopesAt(3, "method")).toContain("entity.name.function.dart");

    const query = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(query).not.toMatch(/\)\s*\.\s*\(selector/);
    expect(query).not.toMatch(/\)\s*\(selector\s+\(argument_part/);
    expect(query).toContain('(#is? test.typeAt "nextNamedSibling.firstNamedChild argument_part")');
  });

  it("keeps large type parents leaf-rooted and tile captures local", async () => {
    const parameters = ["class Box<"];
    for (let index = 0; index < 6000; index++) {
      parameters.push(`  Type${index}${index < 5999 ? "," : ""}`);
    }
    parameters.push("> {}");
    await setUp(parameters.join("\r\n"));
    expectLocalTile(rawCaptures(3000, 3006));

    const argumentsSource = ["Box<"];
    for (let index = 0; index < 6000; index++) {
      argumentsSource.push(`  Type${index}${index < 5999 ? "," : ""}`);
    }
    argumentsSource.push("> value;");
    editor.setText(argumentsSource.join("\r\n"));
    await editor.getBuffer().languageMode.atTransactionEnd();
    expectLocalTile(rawCaptures(3000, 3006));

    const query = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(query).toContain("(#is? test.childOfType type_arguments)");
    expect(query).toContain("(#is? test.childOfType type_parameters)");
    expect(query).not.toMatch(/\((?:type_arguments|type_parameters)\s+"[<>]"/);
  });

  it("keeps object and record pattern fields local", async () => {
    await setUp(
      [
        "void main() {",
        "  for (var Record(field: value) in values) {}",
        "  var (name: item) = record;",
        "}",
      ].join("\n"),
    );
    const scopesAt = (row, text) => {
      const column = editor.lineTextForBufferRow(row).indexOf(text);
      return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
    };
    expect(scopesAt(1, "field")).toContain("variable.other.member.dart");
    expect(scopesAt(2, "name")).toContain("variable.other.member.dart");

    const objectLines = ["void main() {", "  for (var Record("];
    for (let index = 0; index < 6000; index++) {
      objectLines.push(`    field_${index}: value_${index},`);
    }
    objectLines.push("  ) in values) {}", "}");
    await setUp(objectLines.join("\r\n"));
    expect(editor.getBuffer().languageMode.tree.rootNode.hasError).toBe(false);
    let captures = rawCaptures(3000, 3006);
    expect(captures.length).toBeLessThanOrEqual(64);
    expect(
      captures
        .filter(({ name }) => name === "variable.other.member.dart")
        .every(({ node }) => node.startPosition.row >= 3000 && node.startPosition.row < 3006),
    ).toBe(true);

    const recordLines = ["void main() {", "  var ("];
    for (let index = 0; index < 6000; index++) {
      recordLines.push(`    field_${index}: value_${index},`);
    }
    recordLines.push("  ) = record;", "}");
    editor.setText(recordLines.join("\r\n"));
    await editor.getBuffer().languageMode.atTransactionEnd();
    expect(editor.getBuffer().languageMode.tree.rootNode.hasError).toBe(false);
    captures = rawCaptures(3000, 3006);
    expect(captures.length).toBeLessThanOrEqual(64);
    expect(
      captures
        .filter(({ name }) => name === "variable.other.member.dart")
        .every(({ node }) => node.startPosition.row >= 3000 && node.startPosition.row < 3006),
    ).toBe(true);

    const query = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(query).not.toMatch(/\((?:object_pattern|record_pattern)\s+\(identifier\)/);
    expect(query).toContain('(#is? test.childOfType "object_pattern record_pattern")');
  });
});
