export default class Card {
    constructor(id, cardType, cardClass) {
        this.power = 0;
        this.attack = 0;
        this.attackRange = 1;
        this.healthArmor = 0;
        this.basePower = 0;
        this.baseAttack = 0;
        this.baseAttackRange = 1;
        this.baseHealthArmor = 0;
        this.id = id;
        this.cardType = cardType;
        this.cardClass = cardClass;
        this.cardName = '';
        this.cardTitle = '';
        this.cardTribes = [];
        this.cardDescription = '';
    }
}
//# sourceMappingURL=Card.js.map