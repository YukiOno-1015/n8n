import { defineConfig } from 'vitest/config';
import type { InlineConfig } from 'vitest/node';

export const createVitestConfig = (options: InlineConfig = {}) => {
	const vitestConfig = defineConfig({
		test: {
			silent: true,
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./src/__tests__/setup.ts'],
			reporters: process.env.CI === 'true' ? ['default', 'junit'] : ['default'],
			outputFile: { junit: './junit.xml' },
			coverage: {
				enabled: false,
				include: ['src/**/*.{js,jsx,ts,tsx,vue}'],
				exclude: ['src/**/*.{scss,sass,css,md}'],
				provider: 'v8',
				reporter: ['text-summary', 'lcov', 'html-spa'],
			},
			css: {
				modules: {
					classNameStrategy: 'non-scoped',
				},
			},
			...options,
		},
	});

	if (process.env.COVERAGE_ENABLED === 'true' && vitestConfig.test?.coverage) {
		const { coverage } = vitestConfig.test;
		coverage.enabled = true;
		if (process.env.CI === 'true' && coverage.provider === 'v8') {
			coverage.include = ['src/**/*.{js,jsx,ts,tsx,vue}'];
			coverage.reporter = ['cobertura'];
		}
	}

	return vitestConfig;
};

export const vitestConfig = createVitestConfig();
