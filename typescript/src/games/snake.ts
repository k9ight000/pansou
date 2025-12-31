import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Position = { x: number; y: number };
type Direction = Position;

const DEFAULT_WIDTH = 22;
const DEFAULT_HEIGHT = 14;
const INITIAL_LENGTH = 4;

/**
 * 终端贪吃蛇小游戏（支持方向键/WASD、暂停和退出）。
 */
export class SnakeGame {
  private width: number;
  private height: number;
  private snake: Position[] = [];
  private direction: Direction = { x: 1, y: 0 };
  private queuedDirection: Direction = this.direction;
  private food: Position = { x: 0, y: 0 };
  private score = 0;
  private tickMs = 200;
  private readonly minTickMs = 70;
  private loopId: NodeJS.Timeout | null = null;
  private paused = false;
  private finished = false;
  private keypressHandler: ((str: string, key: readline.Key) => void) | null = null;

  constructor(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    this.width = width;
    this.height = height;
  }

  start() {
    if (!process.stdin.isTTY) {
      console.log('当前终端不支持原始键盘输入，贪吃蛇游戏需要在交互式终端中运行。');
      return;
    }

    this.reset();
    this.registerInput();
    this.draw();
    this.startLoop();
  }

  stop(message?: string) {
    this.finished = true;
    this.stopLoop();
    this.unregisterInput();
    if (message) {
      console.log(message);
    }
  }

  private reset() {
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);

    this.snake = Array.from({ length: INITIAL_LENGTH }, (_, index) => ({
      x: centerX - index,
      y: centerY,
    }));
    this.direction = { x: 1, y: 0 };
    this.queuedDirection = this.direction;
    this.score = 0;
    this.tickMs = 200;
    this.paused = false;
    this.finished = false;
    this.placeFood();
  }

  private startLoop() {
    this.stopLoop();
    this.loopId = setInterval(() => this.tick(), this.tickMs);
  }

  private stopLoop() {
    if (this.loopId) {
      clearInterval(this.loopId);
      this.loopId = null;
    }
  }

  private registerInput() {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    this.keypressHandler = (str, key) => this.handleKeypress(str, key);
    process.stdin.on('keypress', this.keypressHandler);
  }

  private unregisterInput() {
    if (this.keypressHandler) {
      process.stdin.off('keypress', this.keypressHandler);
      this.keypressHandler = null;
    }

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  }

  private handleKeypress(_: string, key: readline.Key) {
    if (key.ctrl && key.name === 'c') {
      this.stop('\n收到中断信号，游戏退出。');
      return;
    }

    switch (key.name) {
      case 'up':
      case 'w':
        this.queueDirection({ x: 0, y: -1 });
        break;
      case 'down':
      case 's':
        this.queueDirection({ x: 0, y: 1 });
        break;
      case 'left':
      case 'a':
        this.queueDirection({ x: -1, y: 0 });
        break;
      case 'right':
      case 'd':
        this.queueDirection({ x: 1, y: 0 });
        break;
      case 'space':
        this.togglePause();
        break;
      case 'q':
        this.stop('\n手动退出，感谢游玩！');
        break;
      default:
        break;
    }
  }

  private togglePause() {
    this.paused = !this.paused;
    this.draw();
  }

  private queueDirection(next: Direction) {
    const isOpposite = next.x + this.direction.x === 0 && next.y + this.direction.y === 0;
    if (!isOpposite) {
      this.queuedDirection = next;
    }
  }

  private tick() {
    if (this.paused || this.finished) {
      return;
    }

    this.direction = this.queuedDirection;
    const head = this.snake[0];
    const nextHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

    if (this.hasCollision(nextHead)) {
      this.endGame('撞墙或咬到自己了，游戏结束！');
      return;
    }

    const ateFood = nextHead.x === this.food.x && nextHead.y === this.food.y;
    this.snake.unshift(nextHead);
    if (!ateFood) {
      this.snake.pop();
    } else {
      this.score += 10;
      this.tickMs = Math.max(this.minTickMs, this.tickMs - 10);
      this.placeFood();
      this.startLoop();
    }

    this.draw();
  }

  private hasCollision(pos: Position): boolean {
    const hitWall = pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height;
    const hitSelf = this.snake.some((segment) => segment.x === pos.x && segment.y === pos.y);
    return hitWall || hitSelf;
  }

  private placeFood() {
    const occupied = new Set(this.snake.map((segment) => `${segment.x},${segment.y}`));
    const candidates: Position[] = [];

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) {
      this.endGame('恭喜！你填满了整个地图！');
      return;
    }

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    this.food = choice;
  }

  private draw() {
    if (!process.stdout.isTTY) {
      return;
    }

    const grid = Array.from({ length: this.height }, () => Array(this.width).fill(' '));

    this.snake.forEach((segment, index) => {
      grid[segment.y][segment.x] = index === 0 ? 'O' : 'o';
    });
    grid[this.food.y][this.food.x] = '*';

    const borderTop = `┌${'─'.repeat(this.width)}┐`;
    const borderBottom = `└${'─'.repeat(this.width)}┘`;
    const board = grid
      .map((row) => `│${row.join('')}│`)
      .join('\n');

    const lines = [
      '\x1Bc', // 清屏
      `分数: ${this.score.toString().padStart(4, ' ')}` +
        `    速度: ${(1000 / this.tickMs).toFixed(1)} 步/秒`,
      '操作: 方向键/WASD 移动 · 空格暂停/继续 · Q 退出',
      this.paused ? '⏸ 暂停中' : '',
      borderTop,
      board,
      borderBottom,
    ].filter(Boolean);

    if (this.finished) {
      lines.push('💀 游戏结束，按 Q 退出或 Ctrl+C 关闭终端。');
    }

    process.stdout.write(`${lines.join('\n')}\n`);
  }

  private endGame(message: string) {
    this.finished = true;
    this.stopLoop();
    this.draw();
    console.log(message);
    this.unregisterInput();
  }
}

export function runSnakeGame() {
  const game = new SnakeGame();
  game.start();
}

const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  runSnakeGame();
}
