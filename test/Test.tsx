import { graphql, createFragmentContainer } from 'react-relay';

import { Test_todo } from '../__generated__/Test_todo.graphql';

createFragmentContainer(Test, graphql`fragment Test_todo on Node { id ... on Todo { complete } }`);


const x = graphql`query TestQuery { viewer { todos { edges { node { ...Test_todo } } } } }`;
