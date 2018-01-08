import { graphql, createFragmentContainer } from 'react-relay';

import { Test2_todo_ref } from '../__generated__/Test2_todo.graphql';
import { Test_todo } from '../__generated__/Test_todo.graphql';

function withTodo2<T extends { ' fragments': Test2_todo_ref }>(todo: T) {
	return;
}

const todo: Test_todo = null as any;

todo.

	withTodo2(todo);

createFragmentContainer(Test, graphql`fragment Test_todo on Node { id ... on Todo { complete ...Test3_todo } }`);

const x = graphql`query TestQuery($first: Int = 100) { viewer { todos(first: $first) { edges { node { ...Test_todo id } ... Test_edges } } } }`;

graphql`fragment Test_edges on TodoEdge @relay(plural: true) { node { ... Test3_todo } }`;
