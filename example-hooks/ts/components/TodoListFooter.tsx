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

import RemoveCompletedTodosMutation from "../mutations/RemoveCompletedTodosMutation"

import React from "react"
import { graphql, useRelayEnvironment, useFragment } from "react-relay/hooks"

import { TodoListFooter_viewer$key } from "../__relay_artifacts__/TodoListFooter_viewer.graphql"

interface Props {
  viewer: TodoListFooter_viewer$key
  onSetAppend: () => void;
  append: boolean;
}

const TodoListFooter = (props: Props) => {
  const environment = useRelayEnvironment()

  const viewer = useFragment(
    graphql`
      fragment TodoListFooter_viewer on User {
        id
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
    `,
    props.viewer,
  )

  const numCompletedTodos = viewer.completedCount || 0
  const numRemainingTodos = (viewer.totalCount || 0) - numCompletedTodos

  const handleRemoveCompletedTodosClick = () => {
    RemoveCompletedTodosMutation.commit(
      environment,
      viewer.completedTodos,
      viewer,
    )
  }

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{numRemainingTodos}</strong> item
        {numRemainingTodos === 1 ? "" : "s"} left
      </span>
      <label>
        <input type="checkbox" value={props.append} onChange={props.onSetAppend}/>
        Append
      </label>
      {numCompletedTodos > 0 && (
        <button
          className="clear-completed"
          onClick={handleRemoveCompletedTodosClick}
        >
          Clear completed
        </button>
      )}
    </footer>
  )
}

export default TodoListFooter
