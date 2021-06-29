module.exports = {
	setupFiles: ['<rootDir>/src/jest/global.ts'],
	moduleNameMapper: {
		'^@src(.*)$': '<rootDir>/src$1',
		'^@shared(.*)$': '<rootDir>/../shared/src$1',
	},
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
}
