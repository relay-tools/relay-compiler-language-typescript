import { formatterFactory } from "../src/formatGeneratedModule";

describe("formatGeneratedModule", () => {
  it("works", () => {
    const formatGeneratedModule = formatterFactory({ noImplicitAny: true });
    expect(
      formatGeneratedModule({
        moduleName: "complete-example",
        // @ts-ignore
        documentType: "ConcreteFragment",
        docText: null,
        concreteText: JSON.stringify({ the: { fragment: { data: 42 } } }),
        typeText: "export type CompleteExample = { readonly id: string }",
        hash: "@relayHash abcde",
        sourceHash: "edcba",
      })
    ).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */
      // @ts-nocheck
      /* @relayHash abcde */

      import { ConcreteFragment } from \\"relay-runtime\\";
      export type CompleteExample = { readonly id: string }


      const node: ConcreteFragment = { \\"the\\": { \\"fragment\\": { \\"data\\": 42 } } } as any;
      (node as any).hash = 'edcba';
      export default node;
      "
    `);
  });

  it("works without passing relay runtime module explicitly", () => {
    const formatGeneratedModule = formatterFactory({ noImplicitAny: true });
    expect(
      formatGeneratedModule({
        moduleName: "complete-example",
        // @ts-ignore
        documentType: "ConcreteFragment",
        docText: null,
        concreteText: JSON.stringify({ the: { fragment: { data: 42 } } }),
        typeText: "export type CompleteExample = { readonly id: string }",
        hash: "@relayHash abcde",
        sourceHash: "edcba",
      })
    ).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */
      // @ts-nocheck
      /* @relayHash abcde */

      import { ConcreteFragment } from \\"relay-runtime\\";
      export type CompleteExample = { readonly id: string }


      const node: ConcreteFragment = { \\"the\\": { \\"fragment\\": { \\"data\\": 42 } } } as any;
      (node as any).hash = 'edcba';
      export default node;
      "
    `);
  });

  it("doesn't add a typecast if noImplicitAny is not set", () => {
    const formatGeneratedModule = formatterFactory();
    expect(
      formatGeneratedModule({
        moduleName: "complete-example",
        // @ts-ignore
        documentType: "ConcreteFragment",
        docText: null,
        concreteText: JSON.stringify({ the: { fragment: { data: 42 } } }),
        typeText: "export type CompleteExample = { readonly id: string }",
        hash: null,
        sourceHash: "edcba",
      })
    ).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */
      // @ts-nocheck

      import { ConcreteFragment } from \\"relay-runtime\\";
      export type CompleteExample = { readonly id: string }


      const node: ConcreteFragment = {\\"the\\":{\\"fragment\\":{\\"data\\":42}}};
      (node as any).hash = 'edcba';
      export default node;
      "
    `);
  });

  it("doesn't replace cjs require calls if module system is not esm", () => {
    const formatGeneratedModule = formatterFactory();
    expect(
      formatGeneratedModule({
        moduleName: "complete-example",
        // @ts-ignore
        documentType: "ReaderFragment",
        docText: null,
        concreteText: JSON.stringify({
          the: {
            fragment: {
              metadata: {
                refetch: {
                  operation: "require('./RefetchableFragmentQuery.graphql.ts')",
                },
              },
            },
          },
        }),
        typeText: "export type CompleteExample = { readonly id: string }",
        hash: null,
        sourceHash: "edcba",
      })
    ).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */
      // @ts-nocheck

      import { ReaderFragment } from \\"relay-runtime\\";
      export type CompleteExample = { readonly id: string }


      const node: ReaderFragment = {\\"the\\":{\\"fragment\\":{\\"metadata\\":{\\"refetch\\":{\\"operation\\":\\"require('./RefetchableFragmentQuery.graphql.ts')\\"}}}}};
      (node as any).hash = 'edcba';
      export default node;
      "
    `);
  });

  it("replaces cjs require calls by (top-level) esm imports if module system is esm", () => {
    const formatGeneratedModule = formatterFactory({
      module: ts.ModuleKind.ES2015,
    });
    expect(
      formatGeneratedModule({
        moduleName: "complete-example",
        // @ts-ignore
        documentType: "ReaderFragment",
        docText: null,
        concreteText: JSON.stringify({
          the: {
            fragment: {
              metadata: {
                refetch: {
                  operation: "require('./RefetchableFragmentQuery.graphql.ts')",
                },
              },
            },
          },
        }),
        typeText: "export type CompleteExample = { readonly id: string }",
        hash: null,
        sourceHash: "edcba",
      })
    ).toMatchInlineSnapshot(`
      "/* tslint:disable */
      /* eslint-disable */
      // @ts-nocheck

      import { ReaderFragment } from \\"relay-runtime\\";
      import RefetchableFragmentQuery from \\"./RefetchableFragmentQuery.graphql\\";
      export type CompleteExample = { readonly id: string }


      const node: ReaderFragment = {\\"the\\":{\\"fragment\\":{\\"metadata\\":{\\"refetch\\":{\\"operation\\":\\"RefetchableFragmentQuery\\"}}}}};
      (node as any).hash = 'edcba';
      export default node;
      "
    `);
  });
});
