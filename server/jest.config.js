module.exports = {
	"setupFiles": [
		"<rootDir>/src/jest/global.ts"
	],
	"moduleNameMapper": {
		"^@shared(.*)$": "<rootDir>/../shared/src$1"
	},
	"roots": [
		"<rootDir>/src"
	],
	"testMatch": [
		"**/__tests__/**/*.+(ts|tsx|js)",
		"**/?(*.)+(spec|test).+(ts|tsx|js)"
	],
	"transform": {
		"^.+\\.(ts|tsx)$": "ts-jest"
	},
}

