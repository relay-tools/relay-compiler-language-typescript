import * as React from "react"
import { useLazyLoadQuery, graphql } from "react-relay"

import { TodoRootQuery } from "../__relay_artifacts__/TodoRootQuery.graphql"

import TodoApp from "./TodoApp"

import ErrorBoundaryWithRetry from "../ErrorBoundaryWithRetry"

const TodoRoot = () => {
  const { viewer } = useLazyLoadQuery<TodoRootQuery>(
    graphql`
      query TodoRootQuery {
        viewer {
          ...TodoApp_viewer
        }
      }
    `,
    {},
  )

  return <TodoApp viewer={viewer} />
}

const TodoRootWrapper = () => {
  return (
    <ErrorBoundaryWithRetry fallback={error => <div>{error.message}</div>}>
      <React.Suspense fallback={<div>Loading</div>}>
        <TodoRoot />
      </React.Suspense>
    </ErrorBoundaryWithRetry>
  )
}

export default TodoRootWrapper
