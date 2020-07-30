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

import AddTodoMutation from "../mutations/AddTodoMutation"
import TodoList from "./TodoList"
import TodoListFooter from "./TodoListFooter"
import TodoTextInput from "./TodoTextInput"

import React from "react"
import { graphql, useFragment, useRelayEnvironment } from "react-relay/hooks"

import { TodoApp_viewer$key } from "../__relay_artifacts__/TodoApp_viewer.graphql"

interface Props {
  viewer: TodoApp_viewer$key
}

const TodoApp = (props: Props) => {
  const environment = useRelayEnvironment()
  const [append, setAppend] = React.useState<boolean>(false);

  const viewer = useFragment(
    graphql`
      fragment TodoApp_viewer on User {
        id
        totalCount
        ...TodoListFooter_viewer
        ...TodoList_viewer
      }
    `,
    props.viewer,
  )

  const handleTextInputSave = (text: string) => {
    AddTodoMutation.commit(environment, text, viewer, append)
  }

  const hasTodos = (viewer.totalCount || 0) > 0

  const onSetAppend = () => setAppend(prev => !prev);

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
        {hasTodos && <TodoListFooter viewer={viewer} onSetAppend={onSetAppend} append={append}/>}
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
