## Examples of generated artifacts

See [here](example/ts/__generated__/).

## Installation

### Package

First clone and build Relay packages:

```
git clone https://github.com/alloy/relay.git -b language-plugin
cd relay
yarn install
yarn build
cd dist/babel-plugin-relay && npm pack
cd dist/react-relay && npm pack
cd dist/relay-compiler && npm pack
cd dist/relay-runtime && npm pack
cd dist/relay-test-utils && npm pack
cd ..
```

Then setup package:

```
git clone https://github.com/kastermester/relay-compiler-language-typescript.git
cd relay-compiler-language-typescript
yarn install
```

### Example

After following the above package steps:

```
npm pack
cd example
yarn install
yarn build
yarn start
```
