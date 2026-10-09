describe("language-dart editor line comments", () => {
  let editor;
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-dart");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.dart"));
  });
  afterEach(async () => {
    editor.destroy();
    await lumine.packages.deactivatePackage("language-dart");
  });
  it("comments source with a valid two-slash marker and round-trips it", async () => {
    editor.setText("value\n");
    editor.setCursorBufferPosition([0, 0]);
    await editor.whenGrammarSettled();
    editor.toggleLineCommentsInSelection();
    expect(editor.getText()).toBe("// value\n");
    editor.toggleLineCommentsInSelection();
    expect(editor.getText()).toBe("value\n");
  });
  it("removes an existing language line comment without leaving an operator", async () => {
    editor.setText("// value\n");
    editor.setCursorBufferPosition([0, 0]);
    await editor.whenGrammarSettled();
    editor.toggleLineCommentsInSelection();
    expect(editor.getText()).toBe("value\n");
  });
});
