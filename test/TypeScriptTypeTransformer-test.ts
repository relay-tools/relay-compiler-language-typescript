import * as ts from "typescript";

import * as TypeScriptTypeTransformers from "../src/TypeScriptTypeTransformers";
import { GraphQLScalarType, GraphQLNonNull } from "graphql";

const MyCustomScalar = new GraphQLScalarType({
  name: "MyCustomScalar",
  serialize: () => {}
});

describe("custom scalar handling", () => {
  it.each([
    ["ID", ts.SyntaxKind.StringKeyword],
    ["String", ts.SyntaxKind.StringKeyword],
    ["Url", ts.SyntaxKind.StringKeyword],
    ["Float", ts.SyntaxKind.NumberKeyword],
    ["Int", ts.SyntaxKind.NumberKeyword],
    ["Boolean", ts.SyntaxKind.BooleanKeyword],
    ["any", ts.SyntaxKind.AnyKeyword],
    ["DoesntExist", ts.SyntaxKind.UnknownKeyword]
  ])("converts %s correctly", (customScalar: string, expectedKind: number) => {
    const outputType = TypeScriptTypeTransformers.transformScalarType(
      GraphQLNonNull(MyCustomScalar),
      {
        customScalars: { MyCustomScalar: customScalar }
      }
    );
    expect(outputType.kind).toEqual(expectedKind);
  });
});
