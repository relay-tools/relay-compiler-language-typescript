# relay-compiler-language-typescript

A language plugin for [Relay](https://facebook.github.io/relay/) that adds TypeScript support, including emitting type
definitions.

⚠️ As of this writing, [the pull-request](https://github.com/facebook/relay/pull/2293) that adds language plugin support
to Relay has not yet been merged. Thus, if you want to use this plugin you’ll have to cut a release with that patch
yourself. Alternatively, you can use prebuilt packages that [Artsy uses](https://github.com/alloy/relay/releases) (use the ones that are of the form `vx.x.x-plugin.x`, not `vx.x.x-artsy.x`).

## Installation

Add the package to your dev dependencies:

```
yarn add relay-compiler-language-typescript --dev
```

Then configure your `relay-compiler` script to use it, like so:

```json
{
  "scripts": {
    "relay": "relay-compiler --src ./src --schema data/schema.graphql --language typescript --artifactDirectory ./src/__generated__"
  }
}
```

This is going to store all artifacts in a single directory, which you also need to instruct the Babel plugin to use:

```json
{
  "plugins": [
    ["relay", { "artifactDirectory": "./src/__generated__" }]
  ]
}
```

## Examples

You can find a copy of the Relay
[example TODO app](https://github.com/kastermester/relay-compiler-language-typescript/tree/master/example) inside this
repository or you can take a look at the [Artsy React Native app](https://github.com/artsy/emission).

## License

This package is available under the MIT license. See the included LICENSE file for details.
