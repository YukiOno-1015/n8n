namespace jest {
	interface Matchers<R, T> {
		toBeCalled(): T;
		toBeCalledTimes(expected: number): T;
		toBeCalledWith(...args: unknown[]): T;
		toThrowError(expected?: unknown): T;
	}
}

declare module 'minifaker';
