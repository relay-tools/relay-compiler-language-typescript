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

import {
  commitMutation,
  graphql,
} from 'react-relay';
import {ConnectionHandler, Environment, RecordSourceSelectorProxy} from 'relay-runtime';

import { Todo_todo } from '../components/__generated__/Todo_todo.graphql';
import { Todo_viewer } from '../components/__generated__/Todo_viewer.graphql';

const mutation = graphql`
  mutation RemoveTodoMutation($input: RemoveTodoInput!) {
    removeTodo(input: $input) {
      deletedTodoId,
      viewer {
        completedCount,
        totalCount,
      },
    }
  }
`;

function sharedUpdater(store: RecordSourceSelectorProxy, user: Todo_viewer, deletedID: string) {
  const userProxy = store.get(user.id);
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'TodoList_todos',
  );
  ConnectionHandler.deleteNode(
    conn,
    deletedID,
  );
}

function commit(
  environment: Environment,
  todo: Todo_todo,
  user: Todo_viewer,
) {
  return commitMutation(
    environment,
    {
      mutation,
      variables: {
        input: {id: todo.id},
      },
      updater: (store) => {
        const payload = store.getRootField('removeTodo');
        if (!payload) throw new Error('assertion failed')
        sharedUpdater(store, user, payload.getValue('deletedTodoId'));
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, user, todo.id);
      },
    }
  );
}

export default {commit};
