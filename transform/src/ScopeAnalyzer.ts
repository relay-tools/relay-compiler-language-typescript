import * as ts from 'typescript';
import { isForInStatement, isFunctionDeclaration, isFunctionExpression } from 'typescript';
const enum BindingScope {
  FunctionScope,
  LexicalScope
}

export const enum BindingKind {
  Variable = 1,
  FunctionParameter = 2,
  Class = 3,
  Require = 4,
  Import = 5,
  Export = 6,
}

class Binding {
  bindingScope: BindingScope;
  bindingKind: BindingKind;
  node: ts.Node;

  public constructor(node: ts.Node, bindingScope: BindingScope, bindingKind: BindingKind) {
    this.bindingScope = bindingScope;
    this.bindingKind = bindingKind;
    this.node = node;
  }
}

class Scope {
  private scopeNode: ts.Node;
  private bindings: Map<string, Binding>;
  private parentScope: Scope | null;

  public constructor(scopeNode: ts.Node, parentScope: Scope | null) {
    this.scopeNode = scopeNode;
    this.parentScope = parentScope;
    this.bindings = new Map<string, Binding>();
  }

  public addBinding(name: string, binding: Binding) {
    if (binding.bindingKind === BindingKind.FunctionParameter && !ts.isFunctionLike(this.scopeNode)) {
      throw new Error('Can only add function parameter bindings to a functionlike node');
    }
    switch (binding.bindingScope) {
      case BindingScope.LexicalScope:
        this.bindings.set(name, binding);
        return;
      case BindingScope.FunctionScope:
        // Find the nearest function or source file scope and add the var to that scope
        let scope: Scope = this;
        while (!ts.isFunctionLike(scope.scopeNode) && !ts.isSourceFile(scope.scopeNode)) {
          if (scope.parentScope == null) {
            throw new Error('Attempting to reach parent scope of root scope');
          }
          scope = scope.parentScope;
        }
        scope.bindings.set(name, binding);
        return;
      default:
        throw new Error('Unexpected case');
    }
  }

  public addBindingName(name: ts.BindingName, binding: Binding) {
    if (ts.isIdentifier(name)) {
      this.addBinding(name.text, binding);
      return;
    }
    if (ts.isObjectBindingPattern(name)) {
      name.elements.forEach(element => {
        this.addBindingName(element.name, new Binding(element, binding.bindingScope, binding.bindingKind));
      });
      return;
    }
    name.elements.forEach(element => {
      if (ts.isOmittedExpression(element)) {
        return;
      }
      this.addBindingName(element.name, new Binding(element, binding.bindingScope, binding.bindingKind));
    });
  }

  public getBindingInfo(name: string): BindingKind | null {
    const bindingInfo = this.bindings.get(name);

    if (bindingInfo != null) {
      return bindingInfo.bindingKind;
    }
    if (this.parentScope != null) {
      return this.parentScope.getBindingInfo(name);
    }
    return null;
  }
}

type ScopeNode = ts.Block | ts.SourceFile | ts.FunctionLike;

function isScopeNode(node: ts.Node): boolean {
  return (
    ts.isBlock(node) ||
    ts.isSourceFile(node) ||
    ts.isFunctionLike(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isForStatement(node)
  );
}

function isRequireCall(node: ts.Node): boolean {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require';
}

export class ScopeAnalyzer {
  private readonly scopes: Map<ts.Node, Scope>;
  private isAnalyzed: boolean = false;
  private sourceFile: ts.SourceFile;

  public constructor(sourceFile: ts.SourceFile) {
    this.scopes = new Map<ts.Node, Scope>();
    this.sourceFile = sourceFile;
  }

  private getScopeNode(node: ts.Node): ts.Node {
    while (!isScopeNode(node)) {
      if (node.parent == null) {
        throw new Error('parent not set on node');
      }
      node = node.parent;
    }
    return node;
  }

  private visitScope(node: ts.Node, scope: Scope): void {
    const visitNode = (child: ts.Node) => {
      if (isFunctionDeclaration(child) || isFunctionExpression(child)) {
        if (child.name != null) {
          scope.addBinding(child.name.text, new Binding(child, BindingScope.FunctionScope, BindingKind.Variable));
        }
      }
      if (isScopeNode(child)) {
        this.generateScope(child, scope);
        return;
      }
      if (ts.isVariableDeclarationList(child)) {
        const bindingScope = (child.flags & ts.NodeFlags.BlockScoped) != 0 ? BindingScope.LexicalScope : BindingScope.FunctionScope;
        let bindingKind = child.parent != null && ts.isVariableStatement(child.parent) && child.parent.modifiers != null && child.parent.modifiers.find(x => x.kind === ts.SyntaxKind.ExportKeyword) != null ? BindingKind.Export : BindingKind.Variable;
        child.declarations.forEach(decl => {
          if (decl.initializer != null) {
            if (isRequireCall(decl.initializer)) {
              bindingKind = BindingKind.Require;
            }
            ts.forEachChild(decl.initializer, visitNode);
          }
          scope.addBindingName(decl.name, new Binding(decl, bindingScope, bindingKind));
        });
        return;
      }
      if (ts.isClassDeclaration(child) && child.name != null) {
        scope.addBinding(child.name.text, new Binding(child, BindingScope.LexicalScope, BindingKind.Class));
      }
      if (ts.isImportDeclaration(child) && child.importClause != null) {
        const namedBindings = child.importClause.namedBindings;
        if (namedBindings != null) {
          if (ts.isNamespaceImport(namedBindings)) {
            scope.addBinding(namedBindings.name.text, new Binding(namedBindings, BindingScope.LexicalScope, BindingKind.Import));
          } else {
            namedBindings.elements.forEach(element => {
              scope.addBinding((element.propertyName || element.name).text, new Binding(element, BindingScope.LexicalScope, BindingKind.Import));
            });
          }
        }
        return;
      }
      ts.forEachChild(child, visitNode);
    };
    ts.forEachChild(node, visitNode);
  }

  private generateScope(node: ts.Node, parentScope: Scope | null): Scope {
    const scope = new Scope(node, parentScope);
    this.scopes.set(node, scope);

    if (ts.isFunctionLike(node)) {
      node.parameters.forEach(param => {
        scope.addBindingName(param.name, new Binding(param, BindingScope.FunctionScope, BindingKind.FunctionParameter));
      })
    }

    this.visitScope(node, scope);

    return scope;
  }

  public getScope(node: ts.Node): Scope {
    if (!this.isAnalyzed) {
      this.generateScope(this.sourceFile, null);
      this.isAnalyzed = true;
    }
    const existingScope = this.scopes.get(this.getScopeNode(node));
    if (existingScope != null) {
      return existingScope;
    }
    throw new Error('Unknown scope node');
  }

  public getBindingAtNode(node: ts.Node, name: string): BindingKind | null {
    const scope = this.getScope(node);

    const binding = scope.getBindingInfo(name);
    return binding;
  }
}
