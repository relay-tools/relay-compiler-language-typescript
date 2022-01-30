# Obsolete

This is repository is obsolete as [relay@13](https://github.com/facebook/relay/releases/tag/v13.0.0) now supports TypeScript directly.

# relay-compiler-language-typescript

[![Build Status](https://travis-ci.org/relay-tools/relay-compiler-language-typescript.svg?branch=master)](https://travis-ci.org/relay-tools/relay-compiler-language-typescript)

A language plugin for [Relay](https://facebook.github.io/relay/) that adds
TypeScript support, including emitting type definitions.

## Installation

Add the package to your dev dependencies:

```
yarn add graphql relay-compiler --dev
yarn add typescript relay-compiler-language-typescript --dev
```

**Note:** Starting with version 15.0.0 relay-compiler-language-typescript requires a minimum TypeScript version of 4.5.0 being installed in your project.

## Configuration

### relay-compiler

Then configure your `relay-compiler` script to use it, like so:

```json
{
  "scripts": {
    "relay":
      "relay-compiler --src ./src --schema data/schema.graphql --language typescript --artifactDirectory ./src/__generated__"
  }
}
```

This is going to store all artifacts in a single directory, which you also need
to instruct `babel-plugin-relay` to use in your `.babelrc`:

```json
{
  "plugins": [["relay", { "artifactDirectory": "./src/__generated__" }]]
}
```

### TypeScript

Also be sure to configure the TypeScript compiler to transpile to `ES2015`
modules (or higher) and leave transpilation to `CommonJS` modules (if required)
up to Babel with the following `tsconfig.json` settings:

```json5
{
  "compilerOptions": {
    "module": "ES2015", // ES2015 or higher
    "target": "ES2020"  // best use the highest target setting compatible with your Babel setup
  }
}
```

The reason for this is that `tsc` would otherwise generate code where the
imported `graphql` function is being namespaced (`react_relay_1` in this
example):

```js
react_relay_1.createFragmentContainer(
  MyComponent,
  react_relay_1.graphql`
  ...
`
);
```

… which makes it impossible for `babel-plugin-relay` to find the locations
where the `graphql` function is being used.

*The generated code uses ES2015 module syntax if `module` is set to ES2015 or
higher in your `tsconfig.json`. Note that the `eagerESModules` option from
`relay-compiler` has no effect on the generated code if `module` is ES2015 or
higher.*

#### Custom Headers

If you need to add a custom header to generated files, perhaps for a custom linter
or to get boilerplate license code in, that can be passed in also in compilerOptions
as `banner`:

```json
{
  "compilerOptions": {
    "banner": "/* &copy; 2021 Example.org - @generated code */"
  }
}
```

## Problems

### React Hot Loader

React Hot Loader is known to not always work well with generated code such as
our typing artifacts, which will lead to loading modules _with_ TypeScript types
into the browser and break. As a maintainer of RHL
[pointed out](https://github.com/gaearon/react-hot-loader/issues/1032) in a
similar issue:

> The problem - hot reloading is not "complete"

So
[until RHL will be made “complete”](https://github.com/gaearon/react-hot-loader/issues/1024)
this project can’t gurantee to always work well with it, nor is it our control
to do anything about that.

## Also see

* You can find a copy of the Relay
  [example TODO app](https://github.com/relay-tools/relay-compiler-language-typescript/tree/master/example)
  inside this repository or you can take a look at the
  [Artsy React Native app](https://github.com/artsy/eigen).
* There are Relay tslint rules available
  [here](https://github.com/relay-tools/tslint-plugin-relay).

## License

This package is available under the MIT license. See the included LICENSE file
for details.
