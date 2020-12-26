import express, { Request, Response } from 'express'
import PlayerDatabase from '../database/PlayerDatabase'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import RenderQuality from '@shared/enums/RenderQuality'
import Language from '@shared/enums/Language'
import Utils, { getPlayerFromAuthenticatedRequest, registerFormValidators } from '../utils/Utils'

const router = express.Router()

router.get(
	'/',
	AsyncHandler(async (req: Request, res: Response) => {
		const player = getPlayerFromAuthenticatedRequest(req)
		const playerDatabaseEntry = await PlayerDatabase.selectPlayerById(player.id)
		if (!playerDatabaseEntry) {
			res.status(404)
			res.send()
			return
		}

		res.json({ data: new UserProfileMessage(playerDatabaseEntry) })
	})
)

router.put('/', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)

	interface AcceptedUserSetting {
		name: string
		validator: (args: any) => boolean
		setter: (playerId: string, args: any) => void
	}

	const validateInput = {
		...registerFormValidators,
		userLanguage: (userLanguage: string): boolean => {
			let result = false
			Utils.forEachInStringEnum(Language, (value: Language) => {
				if (value === userLanguage) {
					result = true
				}
			})
			return result
		},
		renderQuality: (renderQuality: string): boolean => {
			let result = false
			Utils.forEachInStringEnum(RenderQuality, (value: RenderQuality) => {
				if (value === renderQuality) {
					result = true
				}
			})
			return result
		},
		volumeLevel: (volume: number): boolean => {
			return volume >= 0 && volume <= 1
		},
	}

	const acceptedSettings: AcceptedUserSetting[] = [
		{
			name: 'username',
			validator: validateInput.username,
			setter: (id: string, value: string) => PlayerLibrary.updateUsername(id, value),
		},
		{
			name: 'password',
			validator: validateInput.password,
			setter: (id: string, value: string) => PlayerLibrary.updatePassword(id, value),
		},
		{
			name: 'userLanguage',
			validator: validateInput.userLanguage,
			setter: (id: string, value: Language) => PlayerDatabase.updatePlayerUserLanguage(id, value),
		},
		{
			name: 'renderQuality',
			validator: validateInput.renderQuality,
			setter: (id: string, value: RenderQuality) => PlayerDatabase.updatePlayerRenderQuality(id, value),
		},
		{
			name: 'masterVolume',
			validator: validateInput.volumeLevel,
			setter: (id: string, value: number) => PlayerDatabase.updatePlayerMasterVolume(id, value),
		},
		{
			name: 'musicVolume',
			validator: validateInput.volumeLevel,
			setter: (id: string, value: number) => PlayerDatabase.updatePlayerMusicVolume(id, value),
		},
		{
			name: 'effectsVolume',
			validator: validateInput.volumeLevel,
			setter: (id: string, value: number) => PlayerDatabase.updatePlayerEffectsVolume(id, value),
		},
		{
			name: 'ambienceVolume',
			validator: validateInput.volumeLevel,
			setter: (id: string, value: number) => PlayerDatabase.updatePlayerAmbienceVolume(id, value),
		},
		{
			name: 'userInterfaceVolume',
			validator: validateInput.volumeLevel,
			setter: (id: string, value: number) => PlayerDatabase.updatePlayerUserInterfaceVolume(id, value),
		},
	]

	const receivedSettings = acceptedSettings.filter((settingDefinition) => typeof req.body[settingDefinition.name] !== 'undefined')
	const validatorsFailedFor = receivedSettings.filter((settingDefinition) => !settingDefinition.validator(req.body[settingDefinition.name]))

	if (validatorsFailedFor.length > 0) {
		const message = `Invalid values: ${validatorsFailedFor.map((definition) => definition.name).join(', ')}`
		throw { status: 400, error: message }
	}

	receivedSettings.forEach((settingDefinition) => {
		const value = req.body[settingDefinition.name]
		settingDefinition.setter(player.id, value)
	})

	PlayerLibrary.removeFromCache(player)

	res.status(204)
	res.send()
})

module.exports = router
