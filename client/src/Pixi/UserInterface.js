export default class UserInterface {
    constructor() {
        this.buttons = [];
        this.pressedButton = null;
    }
    registerButton(renderedButton) {
        this.buttons.push(renderedButton);
    }
    unregisterButton(targetButton) {
        this.buttons = this.buttons.filter(buttons => buttons !== targetButton);
    }
}
//# sourceMappingURL=UserInterface.js.map