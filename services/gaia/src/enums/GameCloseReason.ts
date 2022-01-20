enum GameCloseReason {
	OWNER_REQUEST = 'Owner request',
	MAX_WAIT_TIME_EXCEEDED = 'Maximum player waiting time exceeded',
	MAX_GAME_TIME_EXCEEDED = 'Maximum game time exceeded',
	PLAYER_ACTION_ERROR = 'Player action handling error',
	SPECTATOR_ACTION_ERROR = 'Spectator action handling error',
	AI_ACTION_LOGIC_ERROR = 'AI action handling error',
	NO_PLAYER_SLOTS_ERROR = 'Not enough player slots in chained game',
	NORMAL_CLEANUP = 'Normal post-game cleanup',
	ORPHANED_GAME_CLEANUP = 'Orphaned game cleanup',
}

export default GameCloseReason
