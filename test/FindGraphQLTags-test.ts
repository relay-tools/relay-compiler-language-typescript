import * as FindGraphQLTags from '../src/FindGraphQLTags'

describe('FindGraphQLTags', () => {
  function find(text) {
    return FindGraphQLTags.find(text, '/path/to/TestModule.ts')
  }

  it('extracts a tag', () => {
    expect(find(`
      import { createFragmentContainer, graphql } from 'react-relay'
      export default createFragmentContainer(
        props => <div>{props.artist.name}</div>,
        graphql\`
          fragment TestModule_artist on Artist {
            name
          }
        \`
      )
    `)).toEqual([{
      keyName: null,
      template: `
          fragment TestModule_artist on Artist {
            name
          }
        `,
      sourceLocationOffset: { line: 4, column: 16 },
    }])
  })

  // TODO: Cover all cases where tags are extracted
})
