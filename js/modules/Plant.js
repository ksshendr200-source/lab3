// Базовый класс Растение
export class Plant {
  constructor(cell, type, moistureMin, moistureMax, growthStages) {
    this.cell = cell;
    this.type = type;
    this.moistureMin = moistureMin;
    this.moistureMax = moistureMax;
    this.growthStage = 0;
    this.growthStages = growthStages;
    this.isAlive = true;
  }

  // Проверка влажности
  checkMoisture() {
    if (this.cell.moisture < this.moistureMin || this.cell.moisture > this.moistureMax) {
      this.isAlive = false;
      this.cell.removePlant();
      return false;
    }
    return true;
  }

  // Рост растения
  grow() {
    if (this.isAlive && this.checkMoisture() && this.growthStage < this.growthStages.length - 1) {
      this.growthStage++;
      this.cell.updateAppearance();
      return true;
    }
    return false;
  }

  // Получение иконки растения
  getIcon() {
    return this.growthStages[this.growthStage];
  }

  // Получение информации о растении
  getInfo() {
    return {
      name: this.type,
      moisture: `Влажность: ${this.cell.moisture}%`,
      growth: `Стадия роста: ${this.growthStage + 1}/${this.growthStages.length}`,
      progress: (this.growthStage / (this.growthStages.length - 1)) * 100
    };
  }
}

// Класс Болотник (наследуется от Растение)
export class MarshPlant extends Plant {
  constructor(cell) {
    const growthStages = ['🌱', '🌿', '🪴'];
    super(cell, 'Болотник', 70, 100, growthStages);
  }
}

// Класс Картошка (наследуется от Растение)
export class Potato extends Plant {
  constructor(cell) {
    const growthStages = ['🌱', '🥔', '🥔🥔'];
    super(cell, 'Картошка', 30, 70, growthStages);
  }
}

// Класс Кактус (наследуется от Растение)
export class Cactus extends Plant {
  constructor(cell) {
    const growthStages = ['🌱', '🌵', '🌵🌵'];
    super(cell, 'Кактус', 0, 30, growthStages);
  }
}
