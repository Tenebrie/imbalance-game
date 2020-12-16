import ServerPlayer from './ServerPlayer'
import ServerGame from '../models/ServerGame'
import ServerCard from '../models/ServerCard'
import PlayerInGame from '@shared/models/PlayerInGame'
import ServerHand from '../models/ServerHand'
import ServerDeck from '../models/ServerDeck'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerGraveyard from '../models/ServerGraveyard'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'
import Constants from '@shared/Constants'
import BuffTutoredCard from '../buffs/BuffTutoredCard'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLibrary, {CardConstructor} from '../libraries/CardLibrary'
import CardType from '@shared/enums/CardType'
import GameEventCreators from '../models/events/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import PlayerSpectator from '@shared/models/PlayerSpectator'
import ServerPlayerInGame from './ServerPlayerInGame'

export default class ServerPlayerSpectator implements PlayerSpectator {
	initialized = false

	game: ServerGame
	player: ServerPlayer
	spectatedPlayer: ServerPlayer

	constructor(game: ServerGame, player: ServerPlayer, spectatedPlayer: ServerPlayer) {
		this.game = game
		this.player = player
		this.spectatedPlayer = spectatedPlayer
	}
}
