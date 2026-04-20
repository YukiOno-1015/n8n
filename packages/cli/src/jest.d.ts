namespace jest {
	interface Matchers<R, T> {
		toBeCalled(): T;
		toBeCalledTimes(expected: number): T;
		toBeCalledWith(...args: unknown[]): T;
		toBeEmptyArray(): T;
		toBeEmptySet(): T;
		toBeSetContaining(...items: string[]): T;
		toThrowError(expected?: unknown): T;
	}
}
