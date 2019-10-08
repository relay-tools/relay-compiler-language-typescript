declare module "relay-devtools" {
  export function installRelayDevTools(): void
}

// FIXME: The @types/classnames typings say there is no default export, which is incorrect
declare module "classnames" {
  export default function classnames(classes: any): string
}
