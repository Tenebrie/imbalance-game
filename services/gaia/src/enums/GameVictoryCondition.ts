enum GameVictoryCondition {
	STANDARD_PVP = 'PvP victory condition',
	STANDARD_DRAW = 'Standard draw',
	AI_GAME_WIN = 'Player won vs AI',
	AI_GAME_LOSE = 'Player lost to AI',
	SIMULATED_GROUP_ONE_WIN = 'AI group 0 won vs AI group 1',
	SIMULATED_GROUP_TWO_WIN = 'AI group 1 won vs AI group 0',
	STORY_TRIGGER = 'Story trigger',
	PLAYER_SURRENDERED = 'Player surrendered (Player action)',
	PLAYER_CONNECTION_LOST = 'Player surrendered (Connection lost)',
	PLAYER_STARTED_NEW_GAME = 'Player surrendered (Started new game)',
	SYSTEM_GAME = 'Closing system game',
	CANCELLED = 'Game cancelled',
	UNKNOWN = 'Unknown victory condition',
}

export default GameVictoryCondition
