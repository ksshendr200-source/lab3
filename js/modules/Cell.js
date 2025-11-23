// Базовый класс Клетка
export class Cell {
  constructor(type, x, y) {
    this.type = type; // 'land' или 'water'
    this.x = x;
    this.y = y;
    this.plant = null;
    this.moisture = type === 'water' ? 100 : 50; // Вода всегда имеет 100% влажность
    this.element = null;
  }

  // Создание DOM элемента для клетки
  createElement() {
    const cell = document.createElement('div');
    cell.className = `cell ${this.type}`;
    cell.dataset.x = this.x;
    cell.dataset.y = this.y;

    // Установка цвета в зависимости от влажности (только для земли)
    if (this.type === 'land') {
      this.updateColor();
    }

    this.element = cell;
    return cell;
  }

  // Обновление цвета клетки в зависимости от влажности
  updateColor() {
    if (this.type === 'land' && this.element) {
      // Плавный переход от желтого (0%) до темно-коричневого (100%)
      const hue = 40; // Желтый оттенок
      const saturation = 100;
      const lightness = 70 - (this.moisture / 100) * 40; // От 70% до 30%

      this.element.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } else if (this.type === 'water' && this.element) {
      // Для воды сбрасываем кастомный цвет, чтобы применить CSS
      this.element.style.backgroundColor = '';
    }
  }

  // Добавление растения на клетку
  addPlant(plantClass) {
    if (this.type === 'land' && !this.plant) {
      this.plant = new plantClass(this);
      this.updateAppearance();
      return true;
    }
    return false;
  }

  // Удаление растения с клетки
  removePlant() {
    this.plant = null;
    this.updateAppearance();
  }

  // Обновление внешнего вида клетки
  updateAppearance() {
    if (this.element) {
      // Очистка содержимого
      this.element.innerHTML = '';

      // Добавление иконки растения, если есть
      if (this.plant) {
        const plantIcon = document.createElement('div');
        plantIcon.className = 'plant-icon';
        plantIcon.textContent = this.plant.getIcon();
        this.element.appendChild(plantIcon);
      }

      // Обновление цвета
      this.updateColor();
    }
  }

  // Изменение типа клетки
  changeType() {
    this.type = this.type === 'land' ? 'water' : 'land';
    this.moisture = this.type === 'water' ? 100 : 50;

    if (this.plant) {
      this.removePlant();
    }

    // Обновляем класс элемента
    this.element.className = `cell ${this.type}`;
    this.updateAppearance();

    return this.type;
  }

  // Изменение влажности
  changeMoisture(amount) {
    if (this.type === 'land') {
      this.moisture = Math.max(0, Math.min(100, this.moisture + amount));
      this.updateColor();

      // Проверка состояния растения
      if (this.plant) {
        this.plant.checkMoisture();
      }
    }
  }
}

// Класс Земля (наследуется от Клетка)
export class Land extends Cell {
  constructor(x, y) {
    super('land', x, y);
  }
}

// Класс Вода (наследуется от Клетка)
export class Water extends Cell {
  constructor(x, y) {
    super('water', x, y);
    this.moisture = 100; // Вода всегда имеет 100% влажность
  }

  // Переопределяем changeMoisture для воды - ничего не делаем
  changeMoisture() {
    // Вода не может изменять влажность
  }
}
