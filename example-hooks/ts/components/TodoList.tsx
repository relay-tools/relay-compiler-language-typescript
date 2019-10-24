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

import MarkAllTodosMutation from "../mutations/MarkAllTodosMutation"
import Todo from "./Todo"

import React, { ChangeEvent } from "react"
import { graphql, useFragment, useRelayEnvironment } from "react-relay"

import { TodoList_viewer$key } from "../__relay_artifacts__/TodoList_viewer.graphql"

interface Props {
  viewer: TodoList_viewer$key
}

const TodoList = (props: Props) => {
  const environment = useRelayEnvironment()

  const viewer = useFragment(
    graphql`
      fragment TodoList_viewer on User {
        todos(
          first: 2147483647 # max GraphQLInt
        ) @connection(key: "TodoList_todos") {
          edges {
            node {
              id
              complete
              ...Todo_todo
            }
          }
        }
        id
        totalCount
        completedCount
        ...Todo_viewer
      }
    `,
    props.viewer,
  )

  const numTodos = viewer.totalCount
  const numCompletedTodos = viewer.completedCount

  const handleMarkAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    const complete = e.target.checked
    MarkAllTodosMutation.commit(environment, complete, viewer.todos, viewer)
  }

  const renderTodos = () => {
    if (!viewer.todos || !viewer.todos.edges) {
      throw new Error("assertion failed")
    }
    return viewer.todos.edges.map(edge => {
      const node = edge && edge.node
      if (!node) throw new Error("assertion failed")
      return <Todo key={node.id} todo={node} viewer={viewer} />
    })
  }

  return (
    <section className="main">
      <input
        checked={numTodos === numCompletedTodos}
        className="toggle-all"
        onChange={handleMarkAllChange}
        type="checkbox"
      />
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">{renderTodos()}</ul>
    </section>
  )
}

export default TodoList
