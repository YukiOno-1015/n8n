declare const beforeAll: jest.Lifecycle;
declare const beforeEach: jest.Lifecycle;
declare const afterAll: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;
declare const describe: jest.Describe;
declare const it: jest.It;
declare const test: jest.It;
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
