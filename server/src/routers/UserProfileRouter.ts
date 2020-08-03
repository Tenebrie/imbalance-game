import express, { Request, Response } from 'express'
const router = express.Router()

import ServerPlayer from '../game/players/ServerPlayer'
import PlayerDatabase from '../database/PlayerDatabase'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import RenderQuality from '@shared/enums/RenderQuality'
import Language from '@shared/models/Language'
import Utils from '../utils/Utils'

router.get('/', AsyncHandler(async(req: Request, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const playerDatabaseEntry = await PlayerDatabase.selectPlayerById(player.id)
	res.json({ data: new UserProfileMessage(playerDatabaseEntry) })
}))

router.put('/', (req: Request, res: Response, next) => {
	const player = req['player'] as ServerPlayer

	interface AcceptedUserSetting {
		name: string
		validator: (args: any) => boolean
		setter: (playerId: string, args: any) => void
	}

	const validateInput = {
		password: (password: string): boolean => {
			return password.length > 0
		},
		userLanguage: (userLanguage: string): boolean => {
			Utils.forEachInStringEnum(Language, (value: Language) => {
				if (value === userLanguage) {
					return true
				}
			})
			return false
		},
		renderQuality: (renderQuality: string): boolean => {
			Utils.forEachInStringEnum(RenderQuality, (value: RenderQuality) => {
				if (value === renderQuality) {
					return true
				}
			})
			return false
		},
		volumeLevel: (volume: number): boolean => {
			return volume >= 0 && volume <= 1
		}
	}

	const acceptedSettings: AcceptedUserSetting[] = [
		{
			name: 'password',
			validator: validateInput.password,
			setter: PlayerLibrary.updatePassword.bind(PlayerLibrary),
		},
		{
			name: 'userLanguage',
			validator: validateInput.userLanguage,
			setter: PlayerDatabase.updatePlayerUserLanguage.bind(PlayerDatabase),
		},
		{
			name: 'renderQuality',
			validator: validateInput.renderQuality,
			setter: PlayerDatabase.updatePlayerRenderQuality.bind(PlayerDatabase),
		},
		{
			name: 'masterVolume',
			validator: validateInput.volumeLevel,
			setter: PlayerDatabase.updatePlayerMasterVolume.bind(PlayerDatabase),
		},
		{
			name: 'musicVolume',
			validator: validateInput.volumeLevel,
			setter: PlayerDatabase.updatePlayerMusicVolume.bind(PlayerDatabase),
		},
		{
			name: 'effectsVolume',
			validator: validateInput.volumeLevel,
			setter: PlayerDatabase.updatePlayerEffectsVolume.bind(PlayerDatabase),
		},
		{
			name: 'ambienceVolume',
			validator: validateInput.volumeLevel,
			setter: PlayerDatabase.updatePlayerAmbienceVolume.bind(PlayerDatabase),
		},
		{
			name: 'userInterfaceVolume',
			validator: validateInput.volumeLevel,
			setter: PlayerDatabase.updatePlayerUserInterfaceVolume.bind(PlayerDatabase),
		},
	]

	const receivedSettings = acceptedSettings.filter(settingDefinition => typeof(req.body[settingDefinition.name]) !== 'undefined')
	const validatorsFailedFor = receivedSettings
		.filter(settingDefinition => !settingDefinition.validator(req.body[settingDefinition.name]))

	if (validatorsFailedFor.length > 0) {
		const message = `Invalid values: ${validatorsFailedFor.map(definition => definition.name).join(', ')}`
		throw { status: 400, error: message }
	}

	receivedSettings.forEach(settingDefinition => {
		const value = req.body[settingDefinition.name]
		settingDefinition.setter(player.id, value)
	})

	PlayerLibrary.removeFromCache(player)

	res.status(204)
	res.send()
})

module.exports = router
