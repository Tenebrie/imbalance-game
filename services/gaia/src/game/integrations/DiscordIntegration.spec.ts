import mockFilesystem from 'mock-fs'

import DiscordIntegration, { GaiaSecrets } from './DiscordIntegration'

describe('DiscordIntegration', () => {
	const consoleErrorMock = jest.fn()
	let consoleErrorOriginal: typeof console.error

	beforeAll(() => {
		consoleErrorOriginal = console.error
		console.error = consoleErrorMock
	})

	beforeEach(() => {
		consoleErrorMock.mockReset()
	})

	describe('when secrets file is valid', () => {
		beforeAll(() => {
			mockFilesystem({
				'/run/secrets': {
					gaia: JSON.stringify({
						DISCORD_PING_ROLE_ID: 'ping-role-id',
						DISCORD_ALERT_HOOK: 'alert-hook',
						DISCORD_FEEDBACK_HOOK: 'feedback-hook',
					} as GaiaSecrets),
				},
			})
		})

		it('sets hook links to correct values', () => {
			const discordIntegration = new DiscordIntegration()
			expect(discordIntegration.pingRoleId).toEqual('ping-role-id')
			expect(discordIntegration.hookLinks.alerts).toEqual('https://discord.com/api/webhooks/alert-hook')
			expect(discordIntegration.hookLinks.feedback).toEqual('https://discord.com/api/webhooks/feedback-hook')
		})

		it('does not print error messages', () => {
			new DiscordIntegration()
			expect(consoleErrorMock.mock.calls.length).toEqual(0)
		})
	})

	describe('when secrets file is invalid', () => {
		beforeAll(() => {
			mockFilesystem({
				'/run/secrets': {
					gaia: 'Not a JSON file',
				},
			})
		})

		it('sets links to null values', () => {
			const discordIntegration = new DiscordIntegration()
			expect(discordIntegration.pingRoleId).toEqual(null)
			expect(discordIntegration.hookLinks.alerts).toEqual(null)
			expect(discordIntegration.hookLinks.feedback).toEqual(null)
		})

		it('prints an error message', () => {
			new DiscordIntegration()
			expect(consoleErrorMock.mock.calls.length).toEqual(1)
			expect(consoleErrorMock.mock.calls[0][0]).toEqual('Invalid gaia.json file')
		})
	})

	describe('when secrets file is not provided', () => {
		beforeAll(() => {
			mockFilesystem({
				'/run/secrets': {},
			})
		})

		it('sets hook links to null values', () => {
			const discordIntegration = new DiscordIntegration()
			expect(discordIntegration.pingRoleId).toEqual(null)
			expect(discordIntegration.hookLinks.alerts).toEqual(null)
			expect(discordIntegration.hookLinks.feedback).toEqual(null)
		})

		it('prints an error message', () => {
			new DiscordIntegration()
			expect(consoleErrorMock.mock.calls.length).toEqual(1)
			expect(consoleErrorMock.mock.calls[0][0]).toEqual('Unable to find gaia.json file')
		})
	})

	afterAll(() => {
		console.error = consoleErrorOriginal
		mockFilesystem.restore()
	})
})
