module.exports = {
	setupFiles: ['<rootDir>/src/jest/global.ts'],
	moduleNameMapper: {
		'^@src(.*)$': '<rootDir>/src$1',
		'^@shared(.*)$': '<rootDir>/../../shared/src$1',
	},
	coverageReporters: ['text'],
	collectCoverageFrom: ['**/*.{ts,tsx}'],
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.+(ts|tsx)', '**/?(*.)+(spec|test).+(ts|tsx)'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
}
