var GameTurnPhase;
(function (GameTurnPhase) {
    GameTurnPhase[GameTurnPhase["BEFORE_GAME"] = 0] = "BEFORE_GAME";
    GameTurnPhase[GameTurnPhase["TURN_START"] = 1] = "TURN_START";
    GameTurnPhase[GameTurnPhase["DEPLOY"] = 2] = "DEPLOY";
    GameTurnPhase[GameTurnPhase["SKIRMISH"] = 3] = "SKIRMISH";
    GameTurnPhase[GameTurnPhase["COMBAT"] = 4] = "COMBAT";
    GameTurnPhase[GameTurnPhase["TURN_END"] = 5] = "TURN_END";
    GameTurnPhase[GameTurnPhase["AFTER_GAME"] = 6] = "AFTER_GAME";
})(GameTurnPhase || (GameTurnPhase = {}));
export default GameTurnPhase;
//# sourceMappingURL=GameTurnPhase.js.map