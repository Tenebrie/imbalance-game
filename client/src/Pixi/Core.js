import * as PIXI from 'pixi.js';
import store from '@/Vue/store';
import Input from '@/Pixi/Input';
import Renderer from '@/Pixi/Renderer';
import MainHandler from '@/Pixi/MainHandler';
import ClientGame from '@/Pixi/models/ClientGame';
import RenderedGameBoard from '@/Pixi/models/RenderedGameBoard';
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame';
import IncomingMessageHandlers from '@/Pixi/handlers/IncomingMessageHandlers';
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers';
import RenderedButton from '@/Pixi/models/RenderedButton';
import UserInterface from '@/Pixi/UserInterface';
import TextureAtlas from '@/Pixi/render/TextureAtlas';
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
    static async onConnect(container) {
        Core.keepaliveTimer = setInterval(() => {
            OutgoingMessageHandlers.sendKeepalive();
        }, 30000);
        await TextureAtlas.prepare();
        Core.renderer = new Renderer(container);
        Core.game = new ClientGame();
        Core.input = new Input();
        Core.board = new RenderedGameBoard();
        Core.mainHandler = MainHandler.start();
        Core.userInterface = new UserInterface();
        const endTurnButton = new RenderedButton(new PIXI.Point(this.renderer.pixi.view.width - 100, this.renderer.pixi.view.height / 2), () => {
            OutgoingMessageHandlers.sendEndTurn();
        });
        this.registerButton(endTurnButton);
        console.info('Sending init signal to server');
        OutgoingMessageHandlers.sendInit();
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
    static getPlayer(playerId) {
        if (this.player && this.player.player.id === playerId) {
            return this.player;
        }
        else if (this.opponent && this.opponent.player.id === playerId) {
            return this.opponent;
        }
        throw new Error(`Player ${playerId} does not exist!`);
    }
    static sendMessage(type, data) {
        Core.socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
    static registerButton(renderedButton) {
        Core.renderer.registerButton(renderedButton);
        Core.userInterface.registerButton(renderedButton);
    }
    static unregisterButton(renderedButton) {
        Core.renderer.unregisterButton(renderedButton);
        Core.userInterface.unregisterButton(renderedButton);
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
Core.isReady = false;
//# sourceMappingURL=Core.js.map