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
import { Environment } from "relay-runtime"

import { Todo_todo } from "../__relay_artifacts__/Todo_todo.graphql"
import { RenameTodoMutation } from "../__relay_artifacts__/RenameTodoMutation.graphql"

const mutation = graphql`
  mutation RenameTodoMutation($input: RenameTodoInput!) {
    renameTodo(input: $input) {
      todo {
        id
        text
      }
    }
  }
`

function getOptimisticResponse(text: string, todo: Todo_todo) {
  return {
    renameTodo: {
      todo: {
        id: todo.id,
        text: text,
      },
    },
  }
}

function commit(environment: Environment, text: string, todo: Todo_todo) {
  return commitMutation<RenameTodoMutation>(environment, {
    mutation,
    variables: {
      input: { text, id: todo.id },
    },
    optimisticResponse: getOptimisticResponse(text, todo),
  })
}

export default { commit }
