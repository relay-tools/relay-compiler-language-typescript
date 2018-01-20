import { transformer } from '../src';
import * as ts from 'typescript';
import * as fs from 'async-file';
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

describe('TSTransform', () => {
  it('Should work', async () => {
    const text = 'createFragmentContainer(MyComponent, {todo: graphql`fragment MyFragment_todo on MyType { id }`})';

    expect(transformWithOptions({ isDevVariable: 'IS_DEV', artifactDirectory: '/testing/artifacts' }, text, '/test/MyComponent.ts')).toMatchSnapshot('simple test');
  });
});
