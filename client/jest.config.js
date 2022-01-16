module.exports = {
	moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
	transform: {
		'.*\\.js$': 'babel-jest',
		'.*\\.(ts|tsx)$': 'ts-jest',
		'.*\\.(vue)$': 'vue-jest',
		'.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2|webp)$': 'jest-transform-stub',
	},
	moduleNameMapper: {
		'@/(.*)': '<rootDir>/src/$1',
		'^@shared(.*)$': '<rootDir>/../shared/src$1',
	},
	testEnvironment: 'jsdom',
	setupFiles: ['jest-webgl-canvas-mock'],
	setupFilesAfterEnv: ['<rootDir>/src/jest/global.ts'],
	moduleDirectories: ['node_modules', 'src'],
	verbose: true,
}
