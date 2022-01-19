import '@testing-library/jest-dom'

const silenceLogging = (): void => {
	console.info = jest.fn()
	console.warn = jest.fn()
	console.error = jest.fn()
}

silenceLogging()

const actualConsoleLog = console.log
console.log = (value: string, ...args: any): void => {
	if (value.includes('http://www.pixijs.com/')) {
		return
	}
	actualConsoleLog(value, ...args)
}

import { config } from '@vue/test-utils'

import Localization from '@/Pixi/Localization'

config.global.mixins = [
	{
		created() {
			this.$locale = Localization
		},
	},
]

afterEach(() => {
	jest.useRealTimers()
})
