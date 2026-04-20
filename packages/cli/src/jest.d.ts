declare var beforeAll: jest.Lifecycle;
declare var beforeEach: jest.Lifecycle;
declare var afterAll: jest.Lifecycle;
declare var afterEach: jest.Lifecycle;
declare var describe: jest.Describe;
declare var it: jest.It;
declare var test: jest.It;
declare const expect: jest.Expect;

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
