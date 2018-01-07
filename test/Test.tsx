import { graphql, createFragmentContainer } from 'react-relay';

import { Test2_todo_ref } from './__generated__/Test2_todo.graphql';
import { Test_todo } from './__generated__/Test_todo.graphql';

function withTodo2<T extends { ' fragments': Test2_todo_ref }>(todo: T) {
	return;
}

const todo: Test_todo = null as any;

withTodo2(todo);

createFragmentContainer(Test, graphql`fragment Test_todo on Node { id ... on Todo { complete ...Test3_todo } }`);

const x = graphql`query TestQuery { viewer { todos { edges { node { ...Test_todo @relay(deferrable: true) } ... Test_edges } } } }`;

graphql`fragment Test_edges on TodoEdge @relay(plural: true) { node { ... Test3_todo } }`;
