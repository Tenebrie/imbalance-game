export default {
    getFont(text) {
        let font = 'Roboto';
        let cyrillic = (/[а-яА-Я]/g).exec(text);
        if (cyrillic) {
            font = 'Roboto';
        }
        return font;
    }
};
//# sourceMappingURL=Utils.js.map