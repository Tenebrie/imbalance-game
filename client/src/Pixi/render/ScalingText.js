import * as PIXI from 'pixi.js';
export default class ScalingText extends PIXI.Container {
    get currentFontSize() {
        return this.currentStyle.fontSize;
    }
    set currentFontSize(value) {
        this.currentStyle.fontSize = value;
    }
    get currentLineHeight() {
        return this.currentStyle.lineHeight;
    }
    set currentLineHeight(value) {
        this.currentStyle.lineHeight = value;
    }
    get text() {
        return this.currentText;
    }
    set text(value) {
        this.updateText(value);
    }
    get anchor() {
        return this.currentAnchor;
    }
    set anchor(value) {
        this.updateAnchor(value);
    }
    get style() {
        const parent = this;
        return {
            get fontSize() {
                return parent.currentStyle.fontSize;
            },
            set fontSize(value) {
                parent.updateFont(value, parent.currentLineHeight);
            },
            get lineHeight() {
                return parent.currentStyle.fontSize;
            },
            set lineHeight(value) {
                parent.updateFont(parent.currentFontSize, value);
            }
        };
    }
    constructor(text, style) {
        super();
        this.texts = [];
        this.currentText = text;
        this.currentStyle = style;
        this.currentAnchor = new PIXI.Point();
        this.createNewText();
    }
    updateText(text) {
        if (text === this.currentText) {
            return;
        }
        this.currentText = text;
        while (this.texts.length > 0) {
            this.removeChild(this.texts.shift());
        }
        this.createNewText();
    }
    updateFont(fontSize, lineHeight) {
        if (fontSize === this.currentFontSize && lineHeight === this.currentLineHeight) {
            return;
        }
        this.currentFontSize = fontSize;
        this.currentLineHeight = lineHeight;
        this.texts.forEach(text => {
            text.visible = false;
        });
        const matchingText = this.texts.find(text => text.style.fontSize === fontSize && text.style.lineHeight === lineHeight);
        if (matchingText) {
            matchingText.visible = true;
        }
        else {
            this.createNewText();
            console.log('Creating new text');
        }
    }
    updateAnchor(anchor) {
        if (anchor.equals(this.currentAnchor)) {
            return;
        }
        this.currentAnchor = anchor;
        this.texts.forEach(text => {
            text.anchor = anchor;
        });
    }
    createNewText() {
        while (this.texts.length > 16) {
            console.log('Too many texts. Removing!');
            this.removeChild(this.texts.shift());
        }
        const newText = new PIXI.Text(this.currentText, new PIXI.TextStyle(this.currentStyle));
        newText.anchor = this.currentAnchor;
        this.texts.push(newText);
        this.addChild(newText);
    }
}
//# sourceMappingURL=ScalingText.js.map