import ServerGame from '@src/game/models/ServerGame'

enum RulesetLifecycleHook {
	CREATED,
	PROGRESSION_LOADED,
}

export default RulesetLifecycleHook

export type RulesetLifecycleCallback = (game: ServerGame) => void
