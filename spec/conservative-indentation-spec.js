describe("dart conservative indentation", () => {
  let editor;
  beforeEach(async () => {
    editor = null;
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-dart");
  });
  afterEach(() => editor?.destroy());
  async function start(file, text) {
    if (!editor || !editor.getPath()?.endsWith(file)) {
      editor?.destroy();
      editor = await lumine.workspace.open(file);
    }
    editor.update({ autoIndent: true, tabLength: 2, softTabs: true });
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }
  describe("dart", () => {
    it("indents Enter inside a block", async () => {
      await start("indentation.dart", "void main() {\n}");
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).toBe("  ");
    });
    it("dedents a typed closing brace", async () => {
      await start("indentation.dart", "void main() {\n  run();\n  ");
      editor.setCursorBufferPosition([2, Infinity]);
      await editor.insertText("}", { autoIndent: true, autoDecreaseIndent: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(2)).toBe("}");
    });
    it("reindents a body and its closing delimiter once", async () => {
      await start("indentation.dart", "void main() {\nrun();\n}");
      await editor.autoIndentBufferRows(0, 2);
      expect(editor.getText()).toBe("void main() {\n  run();\n}");
    });
    it("does not add indent after a complete one-line block or delimiters in a comment", async () => {
      for (const text of ["void main() { run(); }", "// { [ ("]) {
        await start("indentation.dart", text);
        editor.moveToEndOfLine();
        await editor.insertNewline();
        expect(editor.lineTextForBufferRow(1)).toBe("");
      }
    });
    it("preserves multiline literal whitespace during reindent", async () => {
      const source = "var value = '''first\n      { [ (\n  last''';";
      await start("indentation.dart", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
    it("preserves multiline comment interiors during reindent", async () => {
      const source = "/* first\n      { [ (\n  last */";
      await start("indentation.dart", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
  });

  it("does not infer indentation from an unfinished declaration", async () => {
    await start("declaration.dart", "var value =");
    editor.setCursorBufferPosition([0, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(1)).toBe("");
  });

  it("keeps quoted recovery punctuation from indenting the next row", async () => {
    for (const source of [
      'var value = "{',
      'var value = "(',
      'var value = "[',
      "var value = '{",
      'var value = r"{',
      'var value = """{',
      'var value = """has" {',
      'var value = "a\\"{',
      'var value = r"${call(',
    ]) {
      await start("recovery.dart", source);
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).withContext(source).toBe("");
    }
  });

  it("retains the current margin while entering recovered literal text", async () => {
    await start("recovery.dart", 'void main() {\n  var value = "{');
    editor.setCursorBufferPosition([1, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(2)).toBe("  ");
  });

  it("retains indentation for real incomplete containers and interpolation", async () => {
    for (const source of [
      'var value = "${call(',
      "void main() {",
      "var value = [",
      'call("done", [',
    ]) {
      await start("recovery.dart", source);
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.indentationForBufferRow(1)).withContext(source).toBe(1);
    }
  });

  it("preserves authored whitespace in recovered multiline literal content", async () => {
    const source = 'var value = """{\n      payload';
    await start("recovery.dart", source);
    await editor.autoIndentBufferRows(1, 1);
    expect(editor.getText()).toBe(source);
  });
});
