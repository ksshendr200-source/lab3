import { Land, Water } from './Cell.js';
import { MarshPlant, Potato, Cactus } from './Plant.js';

// Класс игры
export class Game {
  constructor() {
    this.gridSize = 10;
    this.cells = [];
    this.selectedTool = 'shovel';
    this.selectedCell = null;
    this.plantClasses = {
      'marsh-plant': MarshPlant,
      'potato': Potato,
      'cactus': Cactus
    };
    this.init();
  }

  // Инициализация игры
  init() {
    this.createGrid();
    this.setupEventListeners();
    this.updateWaterInfluence();
  }

  // Создание сетки
  createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    this.cells = [];

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // Создаем случайное распределение земли и воды
        const type = Math.random() > 0.8 ? 'water' : 'land';
        let cell;

        if (type === 'land') {
          cell = new Land(x, y);
        } else {
          cell = new Water(x, y);
        }

        this.cells.push(cell);
        grid.appendChild(cell.createElement());
      }
    }
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    const grid = document.getElementById('grid');
    const tools = document.querySelectorAll('.tool');
    const nextTurnButton = document.getElementById('next-turn');

    // Обработка кликов по клеткам
    grid.addEventListener('click', (e) => {
      const cellElement = e.target.closest('.cell');
      if (cellElement) {
        const x = parseInt(cellElement.dataset.x);
        const y = parseInt(cellElement.dataset.y);
        this.handleCellClick(x, y);
      }
    });

    // Обработка выбора инструментов
    tools.forEach(tool => {
      tool.addEventListener('click', () => {
        tools.forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        this.selectedTool = tool.id;
      });
    });

    // Обработка кнопки следующего хода
    nextTurnButton.addEventListener('click', () => {
      this.nextTurn();
    });
  }

  // Обработка клика по клетке
  handleCellClick(x, y) {
    const cell = this.cells.find(c => c.x === x && c.y === y);
    if (!cell) return;

    this.selectedCell = cell;

    switch(this.selectedTool) {
      case 'shovel':
        const newType = cell.changeType();
        // Если создали воду, обновляем влияние на соседние клетки
        if (newType === 'water') {
          this.updateWaterInfluence();
        }
        break;
      case 'bucket':
        if (cell.type === 'land') {
          cell.changeMoisture(20);
        }
        break;
      case 'marsh-plant':
      case 'potato':
      case 'cactus':
        const plantClass = this.plantClasses[this.selectedTool];
        if (cell.addPlant(plantClass)) {
          this.showPlantInfo(cell);
        }
        break;
    }

    // Показ информации о растении
    if (cell.plant) {
      this.showPlantInfo(cell);
    } else {
      this.hidePlantInfo();
    }
  }

  // Показать информацию о растении
  showPlantInfo(cell) {
    const plantInfo = document.getElementById('plant-info');
    const plantName = document.getElementById('plant-name');
    const plantMoisture = document.getElementById('plant-moisture');
    const plantGrowth = document.getElementById('plant-growth');
    const growthProgress = document.getElementById('growth-progress');

    const info = cell.plant.getInfo();
    plantName.textContent = info.name;
    plantMoisture.textContent = info.moisture;
    plantGrowth.textContent = info.growth;
    growthProgress.style.width = `${info.progress}%`;

    plantInfo.style.display = 'block';
  }

  // Скрыть информацию о растении
  hidePlantInfo() {
    const plantInfo = document.getElementById('plant-info');
    plantInfo.style.display = 'none';
  }

  // Обновление влияния воды на соседние клетки
  updateWaterInfluence() {
    // Сначала сбросим влажность всех земельных клеток
    this.cells.forEach(cell => {
      if (cell.type === 'land') {
        cell.moisture = 50;
      }
    });

    // Затем обновим влажность на основе близости к воде
    this.cells.forEach(cell => {
      if (cell.type === 'water') {
        this.updateMoistureFromWater(cell);
      }
    });

    // Обновим внешний вид всех клеток
    this.cells.forEach(cell => {
      cell.updateAppearance();
    });
  }

  // Обновление влажности от водной клетки
  updateMoistureFromWater(waterCell) {
    this.cells.forEach(cell => {
      if (cell.type === 'land') {
        const distance = Math.max(
          Math.abs(cell.x - waterCell.x),
          Math.abs(cell.y - waterCell.y)
        );

        if (distance <= 2) {
          // Влажность уменьшается с расстоянием
          const moistureIncrease = (3 - distance) * 10;
          cell.moisture = Math.min(100, cell.moisture + moistureIncrease);
        }
      }
    });
  }

  // Следующий ход - рост растений
  nextTurn() {
    let anyPlantGrew = false;

    this.cells.forEach(cell => {
      if (cell.plant && cell.plant.isAlive) {
        // Сначала проверяем, подходит ли влажность
        const moistureOk = cell.plant.checkMoisture();

        // Если растение все еще живо и влажность подходит, пытаемся его вырастить
        if (cell.plant && cell.plant.isAlive && moistureOk) {
          const grew = cell.plant.grow();
          if (grew) {
            anyPlantGrew = true;
          }
        }

        // Естественное изменение влажности
        if (cell.type === 'land') {
          // Влажность немного уменьшается каждый ход
          cell.changeMoisture(-5);
        }
      }
    });

    // Обновление информации, если показывается растение
    if (this.selectedCell && this.selectedCell.plant) {
      this.showPlantInfo(this.selectedCell);
    }

    // Визуальная обратная связь о росте
    if (anyPlantGrew) {
      const button = document.getElementById('next-turn');
      button.style.backgroundColor = '#2E8B57';
      setTimeout(() => {
        button.style.backgroundColor = '#4CAF50';
      }, 300);
    }
  }
}
