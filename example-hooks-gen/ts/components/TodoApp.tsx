/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import TodoList from "./TodoList"
import TodoListFooter from "./TodoListFooter"
import TodoTextInput from "./TodoTextInput"

import React from "react"
import { graphql } from "react-relay"

import {
  TodoAppData$key,
  useRefetchableTodoAppDataFragment,
} from "../__relay_artifacts__/TodoAppData.graphql"
import { useTodoAppAddTodoMutation } from "../__relay_artifacts__/TodoAppAddTodoMutation.graphql"
import { useTodoAppSetAppendingMutation } from "../__relay_artifacts__/TodoAppSetAppendingMutation.graphql"

interface Props {
  frag: TodoAppData$key
}

graphql`
  mutation TodoAppSetAppendingMutation($isAppending: Boolean!) {
    setAppending(appending: $isAppending) {
      isAppending
    }
  }
`

graphql`
  mutation TodoAppAddTodoMutation(
    $input: AddTodoInput!
    $connections: [ID!]!
    $append: Boolean! = true
  ) {
    addTodo(input: $input) {
      todoEdge @include(if: $append) @appendEdge(connections: $connections) {
        __typename
        cursor
        node {
          complete
          id
          text
        }
      }
      todoEdge @skip(if: $append) @prependEdge(connections: $connections) {
        __typename
        cursor
        node {
          complete
          id
          text
        }
      }
      viewer {
        id
        totalCount
      }
    }
  }
`
let tempID = 0

const TodoApp = (props: Props) => {
  graphql`
    fragment TodoAppData on User
    @refetchable(queryName: "TodoAppRefetchQuery")
    @argumentDefinitions(
      last: { type: "Int" }
      first: { type: "Int" }
      after: { type: "String" }
      before: { type: "String" }
    ) {
      id
      totalCount
      isAppending
      ...TodoListFooterData
      ...TodoList
        @arguments(last: $last, first: $first, after: $after, before: $before)
    }
  `
  const [viewer, refetch] = useRefetchableTodoAppDataFragment(props.frag)
  const [addTodo] = useTodoAppAddTodoMutation()
  const [setAppending] = useTodoAppSetAppendingMutation()

  const handleTextInputSave = (text: string) => {
    addTodo({
      variables: {
        input: {
          text,
          clientMutationId: (tempID++).toString(),
        },
        append: viewer.isAppending,
        connections: [`client:${viewer.id}:__TodoList_todos_connection`],
      },
    })
  }

  const hasTodos = (viewer.totalCount || 0) > 0

  const onSetAppend = () => {
    const nextAppendVal = !viewer.isAppending
    setAppending({
      variables: { isAppending: nextAppendVal },
      onCompleted() {
        // Refetch when we reload the fragment
        refetch(
          { first: nextAppendVal ? null : 10, last: nextAppendVal ? 10 : null },
          { fetchPolicy: "store-and-network" },
        )
      },
    })
  }

  return (
    <div>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <TodoTextInput
            autoFocus={true}
            className="new-todo"
            onSave={handleTextInputSave}
            placeholder="What needs to be done?"
          />
        </header>
        <TodoList viewer={viewer} />
        {hasTodos && <TodoListFooter frag={viewer} onSetAppend={onSetAppend} />}
      </section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          Created by the{" "}
          <a href="https://facebook.github.io/relay/">Relay team</a>
        </p>
        <p>
          Part of <a href="http://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </div>
  )
}

export default TodoApp
