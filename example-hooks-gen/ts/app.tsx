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

import "todomvc-common"

import React from "react"
import ReactDOM from "react-dom"

import { RelayEnvironmentProvider } from "react-relay"
import {
  Environment,
  graphql,
  Network,
  RecordSource,
  Store,
} from "relay-runtime"

import TodoRoot from "./components/TodoRoot"
import { loadAppInitialStateQuery } from "./__relay_artifacts__/appInitialStateQuery.graphql"

const mountNode = document.getElementById("root")

function fetchQuery(operation: any, variables: any) {
  return fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then((response) => {
    return response.json()
  })
}

const modernEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
})

graphql`
  query appInitialStateQuery {
    viewer {
      isAppending
    }
  }
`
const queryRef = loadAppInitialStateQuery(modernEnvironment)

ReactDOM.render(
  <RelayEnvironmentProvider environment={modernEnvironment}>
    <React.Suspense fallback={<div />}>
      <TodoRoot queryRef={queryRef} />
    </React.Suspense>
  </RelayEnvironmentProvider>,
  mountNode,
)
