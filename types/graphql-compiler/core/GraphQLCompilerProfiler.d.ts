export function enable(): void;

/**
 * Run the provided function as part of a stack profile.
 */
export function run<T>(name: string, fn: () => T): T;

/**
 * Run the provided async function as part context in a stack profile.
 * See instrumentAsyncContext() for limitations and usage notes.
 */
export function asyncContext<T extends Promise<any>>(name: string, fn: () => T): T;

/**
 * Wait for the provided async operation as an async profile.
 */
export function waitFor<T extends Promise<any>>(name: string, fn: () => T): T;
/**
 * Return a new instrumented sync function to be part of a stack profile.
 *
 * This instruments synchronous functions to be displayed in a stack
 * visualization. To instrument async functions, see instrumentAsyncContext()
 * and instrumentWait().
 */
export function instrument<F extends Function>(fn: F, name?: string): F;

/**
 * Return a new instrumented async function which provides context for a stack.
 *
 * Because the resulting profiling information will be incorporated into a
 * stack visualization, the instrumented function must represent a distinct
 * region of time which does not overlap with any other async context.
 *
 * In other words, functions instrumented with instrumentAsyncContext must not
 * run in parallel via Promise.all().
 *
 * To instrument functions which will run in parallel, use instrumentWait().
 */
export function instrumentAsyncContext<F extends (...a: any[]) => Promise<any>>(
	fn: F,
	name?: string,
): F;

/**
 * Return a new instrumented function which performs an awaited async operation.
 *
 * The instrumented function is not included in the overall run time of the
 * compiler, instead it captures the time waiting on some asynchronous external
 * resource such as network or filesystem which are often run in parallel.
 */
export function instrumentWait<F extends (...a: any[]) => Promise<any>>(fn: F, name?: string): F;

/**
 * Start a stack profile with a particular name, returns an ID to pass to end().
 *
 * Other profiles may start before this one ends, which will be represented as
 * nested operations, however all nested operations must end before this ends.
 *
 * In particular, be careful to end after errors.
 */
export function start(name: string): number;

/**
 * Start an async wait profile with a particular name, returns an ID to pass
 * to end().
 *
 * Other profiles may start before this one ends, which will be represented as
 * nested operations, however all nested operations must end before this ends.
 *
 * In particular, be careful to end after errors.
 */
export function startWait(name: string): number;

export function end(traceIdx: number): void;
