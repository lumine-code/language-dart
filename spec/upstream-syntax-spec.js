describe("Dart constructor and record grammar regressions", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-dart");
    editor = await lumine.workspace.open("constructors.dart");
  });

  afterEach(() => editor?.destroy());

  async function parse(text) {
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
    return editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent);
  }

  it("parses primary constructors and scopes their named constructor", async () => {
    const root = await parse("class Point.named(final int x, final int y);\n");
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("primary_constructor").length).toBe(1);
    const column = editor.lineTextForBufferRow(0).indexOf("named");
    expect(editor.scopeDescriptorForBufferPosition([0, column]).getScopesArray()).toContain(
      "support.type.dart",
    );
  });

  it("parses concise constructors and reparses an edited primary constructor", async () => {
    const root = await parse("class C { const new(); new named(this.x); }\n");
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("constant_constructor_signature").length).toBe(1);
    expect(root.descendantsOfType("constructor_signature").length).toBe(1);
    expect(root.descendantsOfType("constructor_signature")[0].childForFieldName("name").text).toBe(
      "named",
    );

    await parse("class Point(var int x);\n");
    editor.getBuffer().clearUndoStack();
    const column = editor.lineTextForBufferRow(0).indexOf(")");
    editor.setTextInBufferRange(
      [
        [0, column],
        [0, column],
      ],
      ", var int y",
    );
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => !node.parent).hasError).toBe(
      false,
    );
    editor.undo();
    expect(await editor.whenGrammarSettled()).toBe(true);
    expect(editor.getText()).toBe("class Point(var int x);\n");
  });

  it("keeps relational call arguments separate from record type syntax", async () => {
    const root = await parse("void run() { accept(a < (b), c > .zero()); }\n");
    expect(root.hasError).toBe(false);
    expect(root.descendantsOfType("record_type").length).toBe(0);
    expect(root.descendantsOfType("relational_expression").length).toBe(2);
  });
});
