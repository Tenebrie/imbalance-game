import PlayerMessage from './PlayerMessage';
export default class ChatEntryMessage {
    constructor(chatEntry) {
        this.id = chatEntry.id;
        this.sender = PlayerMessage.fromPlayer(chatEntry.sender);
        this.message = chatEntry.message;
    }
    static fromChatEntry(chatEntry) {
        return new ChatEntryMessage(chatEntry);
    }
}
//# sourceMappingURL=ChatEntryMessage.js.map