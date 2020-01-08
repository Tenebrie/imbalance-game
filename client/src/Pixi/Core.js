import store from '@/Vue/store';
import Input from '@/Pixi/Input';
import Renderer from '@/Pixi/Renderer';
import MainHandler from '@/Pixi/MainHandler';
import RenderedGameBoard from '@/Pixi/models/RenderedGameBoard';
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame';
import IncomingMessageHandlers from '@/Pixi/handlers/IncomingMessageHandlers';
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers';
export default class Core {
    static init(gameId, container) {
        const socket = new WebSocket(`ws://${window.location.host}/game/${gameId}`);
        socket.onopen = () => this.onConnect(container);
        socket.onmessage = (event) => this.onMessage(event);
        socket.onclose = (event) => this.onDisconnect(event);
        socket.onerror = (event) => this.onError(event);
        Core.socket = socket;
        Core.player = ClientPlayerInGame.fromPlayer(store.getters.player);
    }
    static onConnect(container) {
        Core.renderer = new Renderer(container);
        Core.keepaliveTimer = setInterval(() => {
            OutgoingMessageHandlers.sendKeepalive();
        }, 30000);
        Core.input = new Input();
        Core.mainHandler = MainHandler.start();
        Core.gameBoard = new RenderedGameBoard();
    }
    static onMessage(event) {
        const data = JSON.parse(event.data);
        const messageType = data.type;
        const messageData = data.data;
        const handler = IncomingMessageHandlers[messageType];
        if (!handler) {
            console.error('Unknown message type: ' + messageType);
            return;
        }
        handler(messageData);
    }
    static onDisconnect(event) {
        if (!event.wasClean) {
            console.error(`Connection closed. Reason: ${event.reason}`);
        }
        clearInterval(Core.keepaliveTimer);
        Core.input.clear();
        Core.mainHandler.stop();
        Core.renderer.destroy();
    }
    static onError(event) {
        console.error('Unknown error occurred', event);
    }
    static registerOpponent(opponent) {
        Core.opponent = opponent;
    }
    static sendMessage(type, data) {
        Core.socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
    static registerCard(renderedCard) {
        Core.renderer.registerCard(renderedCard);
        Core.mainHandler.registerCard(renderedCard);
    }
    static unregisterCard(renderedCard) {
        Core.renderer.unregisterCard(renderedCard);
        Core.mainHandler.unregisterCard(renderedCard);
    }
    static reset() {
        if (!this.socket) {
            return;
        }
        this.socket.close();
    }
}
//# sourceMappingURL=Core.js.map