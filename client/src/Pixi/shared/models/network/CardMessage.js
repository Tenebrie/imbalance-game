export default class CardMessage {
    constructor(card) {
        this.id = card.id;
        this.cardType = card.cardType;
        this.cardClass = card.cardClass;
        this.cardName = card.cardName;
        this.cardTitle = card.cardTitle;
        this.cardTribes = card.cardTribes.slice();
        this.cardDescription = card.cardDescription;
        this.power = card.power;
        this.attack = card.attack;
        this.attackRange = card.attackRange;
        this.healthArmor = card.healthArmor;
        this.basePower = card.basePower;
        this.baseAttack = card.baseAttack;
        this.baseAttackRange = card.baseAttackRange;
        this.baseHealthArmor = card.baseHealthArmor;
    }
    static fromCard(card) {
        return new CardMessage(card);
    }
}
//# sourceMappingURL=CardMessage.js.map