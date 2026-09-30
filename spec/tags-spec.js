const path = require("path");

describe("Dart symbol queries", () => {
  let grammar;
  let editor;

  beforeEach(async () => {
    const pack = await lumine.packages.activatePackage(path.resolve(__dirname, ".."));
    grammar = pack.grammars.find(({ scopeName }) => scopeName === "source.dart");
  });

  afterEach(() => editor?.destroy());

  async function captures(source) {
    editor = await lumine.workspace.open();
    editor.setGrammar(grammar);
    editor.setText(source);
    await editor.whenGrammarSettled();
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
    expect(root.hasError).toBe(false);
    const groups = await editor.getGrammarQueryCaptureGroups("tagsQuery");
    return groups.find((group) => group.grammar === grammar).captures;
  }

  it("references called identifiers without treating arguments or property access as calls", async () => {
    const result = await captures(
      [
        "void main() {",
        "  direct(argument);",
        "  var result = factory(argument);",
        "  object.method(argument);",
        "  object?.nullable(argument);",
        "  object!.asserted(argument);",
        "  object.generic<T>(argument);",
        "  object.property; object.property = argument;",
        "  object..first(argument)..second(argument);",
        "  object?..conditional(argument)..property = value;",
        "  callback!(argument); object.member!(argument);",
        "  new Widget(argument);",
        "}",
      ].join("\n"),
    );
    expect(
      result.filter(({ name }) => name === "reference.call").map(({ node }) => node.text),
    ).toEqual([
      "direct",
      "factory",
      "method",
      "nullable",
      "asserted",
      "generic",
      "first",
      "second",
      "conditional",
      "callback",
      "member",
    ]);
    expect(result.filter(({ name }) => name === "reference.class").length).toBe(1);
    expect(result.filter(({ name }) => name === "definition.function").length).toBe(1);
    expect(result.filter(({ name }) => name === "name").map(({ node }) => node.text)).not.toContain(
      "argument",
    );
  });

  it("keeps captures bounded inside a long call chain", async () => {
    const size = 3000;
    const chain = Array.from({ length: size }, (_, i) => `.method${i}(argument${i})`).join("");
    const source = `void main() { object${chain}; }`;
    const query = await grammar.getQuery("tagsQuery");
    const parser = grammar.createParser(await grammar.getLanguage());
    const tree = parser.parse(source);
    try {
      expect(tree.rootNode.hasError).toBe(false);
      const start = source.indexOf("method1500");
      const local = query.captures(tree.rootNode, {
        startPosition: { row: 0, column: start },
        endPosition: { row: 0, column: start + 12 },
      });
      expect(local.length).toBeLessThanOrEqual(24);
      expect(
        local.every(({ node }) => node.startIndex >= start && node.startIndex < start + 12),
      ).toBe(true);
      expect(query.didExceedMatchLimit()).toBe(false);
    } finally {
      tree.delete();
      parser.delete();
    }
    const result = await captures(source);
    expect(result.filter(({ name }) => name === "reference.call").length).toBe(size);
    expect(result.filter(({ name }) => name === "name").length).toBe(size + 1);
  });
});
