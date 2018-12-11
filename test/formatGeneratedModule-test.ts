import { readFileSync } from 'fs'
import { join } from 'path'

import * as diff from 'jest-diff'

import { formatGeneratedModule } from '../src/formatGeneratedModule'

expect.extend({
  toMatchFile(received, fixturePath) {
    const actual = readFileSync(fixturePath, 'utf8')
    if (received.trim() === actual.trim()) {
      return {
        message: () => `expected ${fixturePath} not to match:\n\n${received}`,
        pass: true,
      }
    } else {
      return {
        message: () => {
          const diffString = diff(actual, received, {
            expand: (this as any).expand,
          });
          return (
            this.utils.matcherHint('.toBe') +
            '\n\n' +
            `Expected value to be (using ===):\n` +
            `  ${this.utils.printExpected(actual)}\n` +
            `Received:\n` +
            `  ${this.utils.printReceived(received)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        },
        pass: false,
      }
    }
  }
})

describe('formatGeneratedModule', () => {
  it('works', () => {
    expect(formatGeneratedModule({
      moduleName: 'complete-example',
      documentType: 'ConcreteFragment',
      docText: null,
      concreteText: JSON.stringify({ the: { fragment: { data: 42 } }}),
      typeText: 'export type CompleteExample = { readonly id: string }',
      hash: 'abcde',
      relayRuntimeModule: 'relay-runtime',
      sourceHash: 'edcba',
    })).toMatchFile(join(__dirname, 'fixtures/generated-module/complete-example.ts'))
  })

  it('works without passing relay runtime module explicitly', () => {
    expect(formatGeneratedModule({
      moduleName: 'complete-example',
      documentType: 'ConcreteFragment',
      docText: null,
      concreteText: JSON.stringify({ the: { fragment: { data: 42 } }}),
      typeText: 'export type CompleteExample = { readonly id: string }',
      hash: 'abcde',
      sourceHash: 'edcba',
    })).toMatchFile(join(__dirname, 'fixtures/generated-module/complete-example.ts'))
  })
})
