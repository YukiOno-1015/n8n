// Jest 30 removed legacy aliases like toBeCalled* and toThrowError.
const aliasMatcher = (matchers: Record<string, unknown>, alias: string, target: string) => {
	if (typeof matchers[alias] !== 'function' && typeof matchers[target] === 'function') {
		matchers[alias] = matchers[target];
	}
};

const baseMatchers = Object.getPrototypeOf(expect(jest.fn())) as Record<string, unknown>;
const notMatchers = Object.getPrototypeOf(expect(jest.fn()).not) as Record<string, unknown>;
const resolvesMatchers = Object.getPrototypeOf(expect(Promise.resolve()).resolves) as Record<
	string,
	unknown
>;
const rejectsMatchers = Object.getPrototypeOf(expect(Promise.resolve()).rejects) as Record<
	string,
	unknown
>;

aliasMatcher(baseMatchers, 'toBeCalled', 'toHaveBeenCalled');
aliasMatcher(baseMatchers, 'toBeCalledWith', 'toHaveBeenCalledWith');
aliasMatcher(baseMatchers, 'toBeCalledTimes', 'toHaveBeenCalledTimes');
aliasMatcher(baseMatchers, 'toThrowError', 'toThrow');

aliasMatcher(notMatchers, 'toBeCalled', 'toHaveBeenCalled');
aliasMatcher(notMatchers, 'toBeCalledWith', 'toHaveBeenCalledWith');
aliasMatcher(notMatchers, 'toBeCalledTimes', 'toHaveBeenCalledTimes');
aliasMatcher(notMatchers, 'toThrowError', 'toThrow');

aliasMatcher(resolvesMatchers, 'toThrowError', 'toThrow');
aliasMatcher(rejectsMatchers, 'toThrowError', 'toThrow');

expect.extend({
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
});
