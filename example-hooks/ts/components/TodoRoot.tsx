import React from "react"
import { useLazyLoadQuery, graphql } from "react-relay/hooks"

import { TodoRootQuery } from "../__relay_artifacts__/TodoRootQuery.graphql"

import TodoApp from "./TodoApp"

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

  return <TodoApp viewer={viewer!} />
}

const TodoRootWrapper = () => {
  return (
    <React.Suspense fallback={<div>Loading</div>}>
      <TodoRoot />
    </React.Suspense>
  )
}

export default TodoRootWrapper
