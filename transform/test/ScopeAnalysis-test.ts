import { ScopeAnalyzer, BindingKind } from "../src/ScopeAnalyzer";
import * as ts from "typescript";

function createSourceFile(text: string): ts.SourceFile {
  return ts.createSourceFile("test.ts", text, ts.ScriptTarget.ES2015, true);
}
describe("Scope analysis", () => {
  test("Basic scope analysis", () => {
    const sf = createSourceFile("const x = 5");
    const analyzer = new ScopeAnalyzer(sf);

    expect(analyzer.getBindingAtNode(sf, "x")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode(sf.statements[0], "x")).toBe(BindingKind.Variable);
  });

  test("Can understand multiple variables per statement", () => {
    const sf = createSourceFile("const x = 5, y = 10");
    const analyzer = new ScopeAnalyzer(sf);

    expect(analyzer.getBindingAtNode(sf, "x")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode(sf, "y")).toBe(BindingKind.Variable);
  });

  test("Understands lexical scoping", () => {
    const sf = createSourceFile("{const x = 5;}");
    const analyzer = new ScopeAnalyzer(sf);

    expect(analyzer.getBindingAtNode(sf, "x")).toBe(null);
    expect(analyzer.getBindingAtNode(sf.statements[0], "x")).toBe(BindingKind.Variable);
  });

  test("Understands function scoping", () => {
    const sf = createSourceFile("{var x = 5;}");
    const analyzer = new ScopeAnalyzer(sf);

    expect(analyzer.getBindingAtNode(sf, "x")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode(sf.statements[0], "x")).toBe(BindingKind.Variable);
  });

  test("Understands function scoping, wrt functions", () => {
    const sf = createSourceFile("function test() {var x = 5;}");
    const analyzer = new ScopeAnalyzer(sf);

    expect(analyzer.getBindingAtNode(sf, "x")).toBe(null);
    expect(analyzer.getBindingAtNode(sf, "test")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode(sf.statements[0], "x")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode(sf.statements[0], "test")).toBe(BindingKind.Variable);
  });

  test("Understands lexical scoping, wrt functions", () => {
    const sf = createSourceFile("function test() {const x = 5;}");
    const analyzer = new ScopeAnalyzer(sf);

    expect(analyzer.getBindingAtNode(sf, "x")).toBe(null);
    expect(analyzer.getBindingAtNode(sf, "test")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode((sf.statements[0] as ts.FunctionDeclaration).body, "x")).toBe(BindingKind.Variable);
    expect(analyzer.getBindingAtNode(sf.statements[0], "test")).toBe(BindingKind.Variable);
  });
});
