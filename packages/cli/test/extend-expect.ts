import { expect as jestGlobalsExpect } from '@jest/globals';

const isMockFunction = (value: unknown): value is jest.Mock =>
	typeof value === 'function' && 'mock' in value && Array.isArray((value as jest.Mock).mock.calls);

const matchesThrownError = (thrown: unknown, expected?: unknown) => {
	if (expected === undefined) return thrown instanceof Error;

	if (expected instanceof RegExp) {
		const message = thrown instanceof Error ? thrown.message : String(thrown);
		return expected.test(message);
	}

	if (typeof expected === 'string') {
		const message = thrown instanceof Error ? thrown.message : String(thrown);
		return message.includes(expected);
	}

	if (typeof expected === 'function') {
		return thrown instanceof (expected as new (...args: unknown[]) => unknown);
	}

	if (expected instanceof Error) {
		if (!(thrown instanceof Error)) return false;
		return thrown.message === expected.message;
	}

	return false;
};

const legacyMatchers = {
	toBeCalled(this: jest.MatcherContext, received: unknown) {
		if (!isMockFunction(received)) {
			return {
				pass: false,
				message: () => 'Expected a Jest mock function',
			};
		}

		const pass = received.mock.calls.length > 0;
		return {
			pass,
			message: () =>
				pass
					? 'Expected mock function not to have been called'
					: 'Expected mock function to have been called',
		};
	},

	toBeCalledTimes(this: jest.MatcherContext, received: unknown, expected: number) {
		if (!isMockFunction(received)) {
			return {
				pass: false,
				message: () => 'Expected a Jest mock function',
			};
		}

		const actual = received.mock.calls.length;
		const pass = actual === expected;
		return {
			pass,
			message: () =>
				pass
					? `Expected mock function not to have been called ${expected} times`
					: `Expected mock function to have been called ${expected} times, but was called ${actual} times`,
		};
	},

	toBeCalledWith(this: jest.MatcherContext, received: unknown, ...expectedArgs: unknown[]) {
		if (!isMockFunction(received)) {
			return {
				pass: false,
				message: () => 'Expected a Jest mock function',
			};
		}

		const pass = received.mock.calls.some((call) => this.equals(call, expectedArgs));
		return {
			pass,
			message: () =>
				pass
					? `Expected mock function not to have been called with ${this.utils.printExpected(expectedArgs)}`
					: `Expected mock function to have been called with ${this.utils.printExpected(expectedArgs)}, but got ${this.utils.printReceived(received.mock.calls)}`,
		};
	},

	toThrowError(this: jest.MatcherContext, received: unknown, expected?: unknown) {
		let thrown: unknown;

		if (typeof received === 'function') {
			try {
				received();
			} catch (error) {
				thrown = error;
			}
		} else {
			thrown = received;
		}

		const pass = matchesThrownError(thrown, expected);
		return {
			pass,
			message: () =>
				pass
					? `Expected value not to throw ${this.utils.printExpected(expected)}`
					: `Expected value to throw ${this.utils.printExpected(expected)}, but got ${this.utils.printReceived(thrown)}`,
		};
	},

	toBeEmptyArray(this: jest.MatcherContext, actual: unknown) {
		const pass = Array.isArray(actual) && actual.length === 0;

		return {
			pass,
			message: pass
				? () => `Expected ${actual} to be an empty array`
				: () => `Expected ${actual} not to be an empty array`,
		};
	},

	toBeEmptySet(this: jest.MatcherContext, actual: unknown) {
		const pass = actual instanceof Set && actual.size === 0;

		return {
			pass,
			message: pass
				? () => `Expected ${[...actual]} to be an empty set`
				: () => `Expected ${actual} not to be an empty set`,
		};
	},

	toBeSetContaining(this: jest.MatcherContext, actual: unknown, ...expectedElements: string[]) {
		const pass = actual instanceof Set && expectedElements.every((e) => actual.has(e));

		return {
			pass,
			message: pass
				? () => `Expected ${[...actual]} to be a set containing ${expectedElements}`
				: () => `Expected ${actual} not to be a set containing ${expectedElements}`,
		};
	},
};

expect.extend(legacyMatchers);

if (jestGlobalsExpect !== expect) {
	jestGlobalsExpect.extend(legacyMatchers);
}
