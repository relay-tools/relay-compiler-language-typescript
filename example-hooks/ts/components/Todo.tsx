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

import ChangeTodoStatusMutation from "../mutations/ChangeTodoStatusMutation"
import RemoveTodoMutation from "../mutations/RemoveTodoMutation"
import RenameTodoMutation from "../mutations/RenameTodoMutation"
import TodoTextInput from "./TodoTextInput"

import * as React from "react"
import { graphql, useRelayEnvironment, useFragment } from "react-relay"

import classnames from "classnames"

import { Todo_todo$key } from "../__relay_artifacts__/Todo_todo.graphql"
import { Todo_viewer$key } from "../__relay_artifacts__/Todo_viewer.graphql"
import { ChangeEvent } from "react"

interface Props {
  todo: Todo_todo$key
  viewer: Todo_viewer$key
}

const Todo = (props: Props) => {
  const [isEditing, setIsEditing] = React.useState(false)

  const environment = useRelayEnvironment()

  const todo = useFragment(
    graphql`
      fragment Todo_todo on Todo {
        complete
        id
        text
      }
    `,
    props.todo,
  )

  const viewer = useFragment(
    graphql`
      fragment Todo_viewer on User {
        id
        totalCount
        completedCount
      }
    `,
    props.viewer,
  )

  const handleCompleteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const complete = e.target.checked
    ChangeTodoStatusMutation.commit(environment, complete, todo!, viewer!)
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
    RenameTodoMutation.commit(environment, text, todo!)
  }
  function removeTodo() {
    RemoveTodoMutation.commit(environment, todo!, viewer!)
  }

  function renderTextInput() {
    return (
      <TodoTextInput
        className="edit"
        commitOnBlur={true}
        initialValue={todo!.text}
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
          checked={!!todo!.complete}
          className="toggle"
          onChange={handleCompleteChange}
          type="checkbox"
        />
        <label onDoubleClick={handleLabelDoubleClick}>{todo!.text}</label>
        <button className="destroy" onClick={handleDestroyClick} />
      </div>
      {isEditing && renderTextInput()}
    </li>
  )
}

export default Todo
