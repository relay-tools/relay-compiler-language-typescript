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
import React, { ChangeEvent } from "react"

import TodoTextInput from "./TodoTextInput"

import { graphql } from "react-relay"

import classnames from "classnames"

import {
  TodoData$key,
  useTodoDataFragment,
} from "../__relay_artifacts__/TodoData.graphql"
import {
  TodoViewer$key,
  useTodoViewerFragment,
} from "../__relay_artifacts__/TodoViewer.graphql"
import { useTodoRenameMutation } from "../__relay_artifacts__/TodoRenameMutation.graphql"
import { useTodoRemoveMutation } from "../__relay_artifacts__/TodoRemoveMutation.graphql"
import { useTodoChangeStatusMutation } from "../__relay_artifacts__/TodoChangeStatusMutation.graphql"
import { ConnectionHandler } from "relay-runtime"

interface Props {
  todo: TodoData$key
  viewer: TodoViewer$key
}

graphql`
  mutation TodoRemoveMutation($input: RemoveTodoInput!) {
    removeTodo(input: $input) {
      deletedTodoId
      viewer {
        completedCount
        totalCount
      }
    }
  }
`

graphql`
  mutation TodoRenameMutation($input: RenameTodoInput!) {
    renameTodo(input: $input) {
      todo {
        id
        text
      }
    }
  }
`

graphql`
  mutation TodoChangeStatusMutation($input: ChangeTodoStatusInput!) {
    changeTodoStatus(input: $input) {
      todo {
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

const Todo = (props: Props) => {
  const [isEditing, setIsEditing] = React.useState(false)

  graphql`
    fragment TodoData on Todo {
      complete
      id
      text
    }
  `
  const todo = useTodoDataFragment(props.todo)

  graphql`
    fragment TodoViewer on User {
      id
      totalCount
      completedCount
    }
  `
  const viewer = useTodoViewerFragment(props.viewer)

  const [commitRename] = useTodoRenameMutation()

  const [commitRemove] = useTodoRemoveMutation()

  const [commitChangeStatus] = useTodoChangeStatusMutation()

  const handleCompleteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const complete = e.target.checked
    commitChangeStatus({
      variables: {
        input: { complete, id: todo.id },
      },
    })
  }
  const handleDestroyClick = () => {
    removeTodo()
  }
  const handleLabelDoubleClick = () => {
    setIsEditing(true)
  }
  const handleTextInputCancel = () => {
    setIsEditing(false)
  }
  const handleTextInputDelete = () => {
    setIsEditing(false)
    removeTodo()
  }
  const handleTextInputSave = (text: string) => {
    setIsEditing(false)
    commitRename({
      variables: {
        input: { text, id: todo.id },
      },
    })
  }
  function removeTodo() {
    commitRemove({
      variables: {
        input: { id: todo.id },
      },
      updater: (store) => {
        const payload = store.getRootField("removeTodo")
        if (!payload) throw new Error("assertion failed")
        const userProxy = store.get(viewer.id)
        const conn = ConnectionHandler.getConnection(
          userProxy!,
          "TodoList_todos",
        )
        ConnectionHandler.deleteNode(
          conn!,
          payload.getValue("deletedTodoId") as string,
        )
      },
    })
  }

  function renderTextInput() {
    return (
      <TodoTextInput
        className="edit"
        commitOnBlur={true}
        initialValue={todo.text}
        onCancel={handleTextInputCancel}
        onDelete={handleTextInputDelete}
        onSave={handleTextInputSave}
      />
    )
  }

  return (
    <li
      className={classnames({
        completed: todo!.complete,
        editing: isEditing,
      })}
    >
      <div className="view">
        <input
          checked={!!todo.complete}
          className="toggle"
          onChange={handleCompleteChange}
          type="checkbox"
        />
        <label onDoubleClick={handleLabelDoubleClick}>{todo.text}</label>
        <button className="destroy" onClick={handleDestroyClick} />
      </div>
      {isEditing && renderTextInput()}
    </li>
  )
}

export default Todo
