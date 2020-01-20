import CardType from '../../enums/CardType';
export default class HiddenCardMessage {
    constructor(card) {
        this.cardType = CardType.HIDDEN;
        this.cardClass = 'cardBack';
        this.cardName = '';
        this.cardTitle = '';
        this.cardTribes = [];
        this.cardDescription = '';
        this.power = 1;
        this.attack = 1;
        this.attackRange = 1;
        this.healthArmor = 0;
        this.basePower = 1;
        this.baseAttack = 1;
        this.baseAttackRange = 1;
        this.baseHealthArmor = 0;
        this.id = card.id;
    }
    static fromCard(card) {
        return new HiddenCardMessage(card);
    }
}
//# sourceMappingURL=HiddenCardMessage.js.map