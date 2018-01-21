import * as ts from 'typescript';
export type Bindings = Map<string, BindingInfo>;
export const enum BindingKind {
  Local,
  Module,
  Import,
  Require,
  Export
}
export interface BindingInfo {
  kind: BindingKind;
}
export function bindingsAtNode(node: ts.Node): Bindings {
  const bindings = new Map<string, BindingInfo>();

  function findInitializerBindings(initializer: ts.ForInitializer) {
    if (ts.isVariableDeclarationList(initializer)) {
      initializer.declarations.forEach(decl => {
        processBinding(decl.name, BindingKind.Local);
      });
    }
  }

  function determineBindingKindFromInitializer(initializer: ts.Expression | undefined): BindingKind {
    if (initializer == null) {
      return BindingKind.Local;
    }
    if (ts.isCallExpression(initializer) && ts.isIdentifier(initializer.expression) && initializer.expression.text === 'require') {
      return BindingKind.Require;
    }
    return BindingKind.Local;
  }

  function findStatementsBindings(block: ts.Block | ts.SourceFile) {
    block.statements.forEach(stmt => {
      if (ts.isClassDeclaration(stmt)) {
        if (stmt.name) {
          addBinding(stmt.name.text, BindingKind.Local);
        }
        return;
      }
      if (ts.isExportDeclaration(stmt)) {
        if (stmt.exportClause) {
          stmt.exportClause.elements.forEach(element => {
            addBinding(element.name.text, BindingKind.Export);
          });
        }
        if (stmt.name) {
          addBinding(stmt.name.text, BindingKind.Export);
        }
        return;
      }
      if (ts.isImportDeclaration(stmt) && stmt.importClause != null) {
        const namedBindings = stmt.importClause.namedBindings;
        if (namedBindings == null) {
          return;
        }
        if (ts.isNamespaceImport(namedBindings)) {
          addBinding(namedBindings.name.text, BindingKind.Import);
        } else {
          namedBindings.elements.forEach(element => {
            addBinding((element.propertyName || element.name).text, BindingKind.Import);
          });
        }
        return;
      }
      if (ts.isVariableStatement(stmt)) {
        stmt.declarationList.declarations.forEach(decl => {
          processBinding(decl.name, determineBindingKindFromInitializer(decl.initializer));
        });
        return;
      }
      // One can declare named functions in tons of weird ways that will end up in scope that this won't catch
      // the same goes for var declarations deep within the code structure.
      if (ts.isExpressionStatement(stmt) && ts.isFunctionExpression(stmt.expression)) {
        if (stmt.expression.name != null) {
          addBinding(stmt.expression.name.text, BindingKind.Local);
        }
        return;
      }
    });
  }

  function addBinding(name: string, kind: BindingKind) {
    if (!bindings.has(name)) {
      bindings.set(name, { kind: kind });
    }
  }

  function processBinding(binding: ts.Identifier | ts.ArrayBindingPattern | ts.ObjectBindingPattern, kind: BindingKind) {
    if (ts.isIdentifier(binding)) {
      addBinding(binding.text, kind);
      return;
    }
    if (ts.isArrayBindingPattern(binding)) {
      binding.elements.forEach(element => {
        if (ts.isBindingElement(element)) {
          processBinding(element.name, kind);
        }
      });
      return;
    }
    binding.elements.forEach(element => {
      if (ts.isBindingElement(element)) {
        processBinding(element.name, kind);
      }
    });
  }

  while (node.parent != null) {
    const parent = node.parent;
    node = parent;
    if (ts.isBlock(parent) || ts.isSourceFile(parent)) {
      findStatementsBindings(parent);
      continue;
    }
    if (ts.isForStatement(parent) && parent.initializer != null) {
      findInitializerBindings(parent.initializer);
      continue;
    }
    if (ts.isForOfStatement(parent)) {
      findInitializerBindings(parent.initializer);
      continue;
    }
  }
  return bindings;
}
