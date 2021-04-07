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
import React from "react"
import { graphql } from "react-relay"

import {
  TodoListFooterData,
  TodoListFooterData$key,
  useTodoListFooterDataFragment,
} from "../__relay_artifacts__/TodoListFooterData.graphql"
import { useTodoListFooterRemoveCompletedTodosMutation } from "../__relay_artifacts__/TodoListFooterRemoveCompletedTodosMutation.graphql"
import { ConnectionHandler, RecordSourceSelectorProxy } from "relay-runtime"

interface Props {
  frag: TodoListFooterData$key
  onSetAppend: () => void
}

graphql`
  fragment TodoListFooterData on User {
    id
    isAppending
    completedCount
    completedTodos: todos(
      status: "completed"
      first: 2147483647 # max GraphQLInt
    ) {
      edges {
        node {
          id
          complete
        }
      }
    }
    totalCount
  }
  mutation TodoListFooterRemoveCompletedTodosMutation(
    $input: RemoveCompletedTodosInput!
  ) {
    removeCompletedTodos(input: $input) {
      deletedTodoIds
      viewer {
        completedCount
        totalCount
      }
    }
  }
`

const TodoListFooter = (props: Props) => {
  const viewer = useTodoListFooterDataFragment(props.frag)

  const [
    commitRemoveCompletedTodos,
    isMutating,
  ] = useTodoListFooterRemoveCompletedTodosMutation()

  const numCompletedTodos = viewer.completedCount || 0
  const numRemainingTodos = (viewer.totalCount || 0) - numCompletedTodos

  const handleRemoveCompletedTodosClick = () => {
    commitRemoveCompletedTodos({
      variables: { input: {} },
      updater: (store) => {
        const payload = store.getRootField("removeCompletedTodos")
        if (!payload) throw new Error("assertion failed")
        sharedRemoveCompletedTodosUpdater(
          store,
          viewer,
          payload.getValue("deletedTodoIds") as string[],
        )
      },
    })
  }

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{numRemainingTodos}</strong> item
        {numRemainingTodos === 1 ? "" : "s"} left
      </span>
      <label>
        <input
          type="checkbox"
          checked={viewer.isAppending}
          onChange={props.onSetAppend}
        />
        Append
      </label>
      {numCompletedTodos > 0 && (
        <button
          className="clear-completed"
          onClick={handleRemoveCompletedTodosClick}
          disabled={isMutating}
        >
          Clear completed
        </button>
      )}
    </footer>
  )
}

function sharedRemoveCompletedTodosUpdater(
  store: RecordSourceSelectorProxy,
  user: TodoListFooterData,
  deletedIDs: string[],
) {
  const userProxy = store.get(user.id)
  const conn = ConnectionHandler.getConnection(userProxy!, "TodoList_todos")
  deletedIDs.forEach((deletedID) =>
    ConnectionHandler.deleteNode(conn!, deletedID),
  )
}

export default TodoListFooter
