import { transformer } from '../src';
import * as ts from 'typescript';
import * as path from 'path';
import { Options } from '../src/Options';
import { generateTestsFromFixtures } from 'relay-test-utils/lib/RelayModernTestUtils'

function transformWithOptions(options: Options, fileName: string) {
  return (text, providedFileName?: string) =>
    ts.transpileModule(text, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        jsx: ts.JsxEmit.Preserve,
        sourceMap: false,
      },
      fileName: fileName,
      transformers: {
        before: [transformer(options)],
      },
    }).outputText;
}

const schemaPath = path.resolve(__dirname, 'testschema.graphql');
const oldSchemaPath = path.resolve(__dirname, 'testschema.old.graphql');

describe('TSTransform', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures-modern`, transformWithOptions({}, '/test/MyComponent.tsx'));

  generateTestsFromFixtures(
    `${__dirname}/fixtures-compat`,
    transformWithOptions({
      compat: true,
      schema: schemaPath,
      substituteVariables: true,
    }, '/test/MyComponent.tsx'),
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures-compat`,
    transformWithOptions({
      compat: true,
      schema: schemaPath,
      substituteVariables: true,
    }, '/test/MyComponent.tsx'),
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures-classic`,
    transformWithOptions({
      schema: oldSchemaPath,
      substituteVariables: true,
    }, '/test/MyComponent.tsx'),
  );

  describe('`development` option', () => {
    it('tests the hash when `development` is set', () => {
      expect(
        transformWithOptions({ isDevelopment: true }, '/test/TestFrag.ts')(
          'graphql`fragment TestFrag on Node { id }`',
        ),
      ).toMatchSnapshot();
    });

    it('tests the hash when `isDevVariable` is set', () => {
      expect(
        transformWithOptions({ isDevVariable: 'IS_DEV' }, '/test/TestFrag.ts')(
          'graphql`fragment TestFrag on Node { id }`',
        ),
      ).toMatchSnapshot();
    });

    it('uses a custom build command in message', () => {
      expect(
        transformWithOptions(
          {
            buildCommand: 'relay-build',
            isDevelopment: true,
          },
          '/test/TestFrag.ts',
        )('graphql`fragment TestFrag on Node { id }`'),
      ).toMatchSnapshot();
    });

    it('does not test the hash when `development` is not set', () => {
      expect(
        transformWithOptions({}, '/test/TestFrag.ts')(
          'graphql`fragment TestFrag on Node { id }`',
        ),
      ).toMatchSnapshot();
    });
  });
});
