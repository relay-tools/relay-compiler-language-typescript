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

import Todo from "./Todo"

import React, { ChangeEvent } from "react"
import { graphql } from "react-relay"

import { useTodoListMarkAllTodosMutation } from "../__relay_artifacts__/TodoListMarkAllTodosMutation.graphql"
import {
  TodoList$key,
  usePaginatedTodoList,
} from "../__relay_artifacts__/TodoList.graphql"

interface Props {
  viewer: TodoList$key
}

graphql`
  fragment TodoList on User
  @argumentDefinitions(
    last: { type: "Int" }
    first: { type: "Int" }
    after: { type: "String" }
    before: { type: "String" }
  )
  @refetchable(queryName: "TodoListRefetchQuery") {
    todos(first: $first, after: $after, last: $last, before: $before)
      @connection(key: "TodoList_todos") {
      edges {
        node {
          id
          complete
          ...TodoData
        }
      }
    }
    id
    totalCount
    completedCount
    ...TodoViewer
  }
  mutation TodoListMarkAllTodosMutation($input: MarkAllTodosInput!) {
    markAllTodos(input: $input) {
      changedTodos {
        id
        complete
      }
      viewer {
        id
        completedCount
      }
    }
  }
`

const TodoList = (props: Props) => {
  const {
    data,
    hasNext,
    hasPrevious,
    loadNext,
    loadPrevious,
    isLoadingNext,
    isLoadingPrevious,
  } = usePaginatedTodoList(props.viewer)
  const [commitMarkAll] = useTodoListMarkAllTodosMutation()

  const numTodos = data.totalCount
  const numCompletedTodos = data.completedCount

  const handleMarkAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    const complete = e.target.checked
    commitMarkAll({
      variables: { input: { complete } },
    })
  }

  const renderTodos = () => {
    if (!data.todos || !data.todos.edges) {
      throw new Error("assertion failed")
    }
    return data.todos.edges.map((edge) => {
      const node = edge && edge.node
      if (!node) throw new Error("assertion failed")
      return <Todo key={node.id} todo={node} viewer={data} />
    })
  }

  return (
    <section className="main">
      {hasPrevious && (
        <button
          className="load-more previous"
          disabled={isLoadingPrevious}
          onClick={(e) => {
            e.preventDefault()
            loadPrevious(10)
          }}
        >
          Load Previous Page
        </button>
      )}
      <input
        checked={numTodos === numCompletedTodos}
        className="toggle-all"
        onChange={handleMarkAllChange}
        type="checkbox"
      />
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">{renderTodos()}</ul>
      {hasNext && (
        <button
          className="load-more next"
          disabled={isLoadingNext}
          onClick={(e) => {
            e.preventDefault()
            loadNext(10)
          }}
        >
          Load Next Page
        </button>
      )}
    </section>
  )
}

export default TodoList
