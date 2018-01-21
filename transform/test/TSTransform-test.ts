import { transformer } from '../src';
import * as ts from 'typescript';
import * as path from 'path';
import { Options } from '../src/Options';

function transformWithOptions(options: Options, contents: string, fileName: string): ts.TranspileOutput {
  return ts.transpileModule(contents, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      sourceMap: true,
    },
    fileName: fileName,
    transformers: {
      before: [transformer(options)],
    },
  });
}

const schemaPath = path.resolve(__dirname, 'testschema.rfc.graphql');

describe('TSTransform', () => {
  it('Modern should compile', async () => {
    const text = 'createFragmentContainer(MyComponent, {todo: graphql`fragment MyFragment_todo on MyType { id }`})';

    expect(transformWithOptions({ isDevVariable: 'IS_DEV', artifactDirectory: '/testing/artifacts' }, text, '/test/MyComponent.ts')).toMatchSnapshot('modern test');
  });
  it('Classic should compile', async () => {
    const text = 'createFragmentContainer(MyComponent, {todo: () => Relay.QL`fragment on Node { id }`})';

    expect(transformWithOptions({ isDevVariable: 'IS_DEV', artifactDirectory: '/testing/artifacts', schema: schemaPath }, text, '/test/MyComponent.ts')).toMatchSnapshot('classic test');
  });
});
