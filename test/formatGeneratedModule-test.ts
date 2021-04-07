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
});
