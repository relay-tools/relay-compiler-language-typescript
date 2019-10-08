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

import { commitMutation, graphql } from "react-relay"
import {
  ConnectionHandler,
  Environment,
  DataID,
  RecordSourceSelectorProxy,
} from "relay-runtime"

import { TodoListFooter_viewer } from "../__relay_artifacts__/TodoListFooter_viewer.graphql"
import { RemoveCompletedTodosMutation } from "../__relay_artifacts__/RemoveCompletedTodosMutation.graphql"

const mutation = graphql`
  mutation RemoveCompletedTodosMutation($input: RemoveCompletedTodosInput!) {
    removeCompletedTodos(input: $input) {
      deletedTodoIds
      viewer {
        completedCount
        totalCount
      }
    }
  }
`

function sharedUpdater(
  store: RecordSourceSelectorProxy,
  user: TodoListFooter_viewer,
  deletedIDs: string[],
) {
  const userProxy = store.get(user.id)
  const conn = ConnectionHandler.getConnection(userProxy!, "TodoList_todos")
  deletedIDs.forEach(deletedID =>
    ConnectionHandler.deleteNode(conn!, deletedID),
  )
}

function commit(
  environment: Environment,
  todos: TodoListFooter_viewer["completedTodos"],
  user: TodoListFooter_viewer,
) {
  return commitMutation<RemoveCompletedTodosMutation>(environment, {
    mutation,
    variables: {
      input: {},
    },
    updater: store => {
      const payload = store.getRootField("removeCompletedTodos")
      if (!payload) throw new Error("assertion failed")
      sharedUpdater(store, user, payload.getValue("deletedTodoIds") as string[])
    },
    optimisticUpdater: store => {
      if (todos && todos.edges) {
        const deletedIDs = todos.edges
          .filter(edge => edge && edge.node && edge.node.complete)
          .map(edge => (edge && edge.node && edge.node.id) as string)
        sharedUpdater(store, user, deletedIDs)
      }
    },
  })
}

export default { commit }
