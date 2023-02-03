import { createCanvas } from 'canvas';
import type { Canvas } from 'canvas';

export interface Config {
	beta: number
	rho: number
	sigma: number
	dt: number
	iterations: number
	result_size: number
}

class Point {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Bounds {
  min: Point
  max: Point

  constructor(min: Point, max: Point) {
    this.min = min;
    this.max = max;
  }

  expand(p: Point) {
  	if (p.x < this.min.x) {
  		this.min.x = p.x
  	}
  	if (p.y < this.min.y) {
  		this.min.y = p.y
  	}
  	if (p.z < this.min.z) {
  		this.min.z = p.z
  	}
  	if (p.x > this.max.x) {
  		this.max.x = p.x
  	}
  	if (p.y > this.max.y) {
  		this.max.y = p.y
  	}
  	if (p.z > this.max.z) {
  		this.max.z = p.z
  	}
  }

  translate(p: Point, resultSize: number): Point {
  	const relX = (p.x - this.min.x) / (this.max.x - this.min.x)
  	const relY = (p.y - this.min.y) / (this.max.y - this.min.y)
  	const relZ = (p.z - this.min.z) / (this.max.z - this.min.z)
  	const s = resultSize - 1.0
  	return new Point(
  		relX * s,
  		relY * s,
  		relZ * s,
  	)
  }
}

const nextStep = (cfg: Config, p: Point): Point => {
	const dxdt = cfg.sigma * (p.y - p.x)
	const dydt = p.x*(cfg.rho-p.z) - p.y
	const dzdt = p.x*p.y - cfg.beta*p.z
	return new Point(
		p.x + dxdt*cfg.dt,
		p.y + dydt*cfg.dt,
		p.z + dzdt*cfg.dt,
	)
}

export const run = (cfg: Config): Canvas => {
	const points: Point[] = new Array(cfg.iterations);
	points[0] = new Point(1, 1, 1);
	const bounds = new Bounds(
    new Point(1, 1, 1),
    new Point(1, 1, 1),
  );
	for (let i = 1; i < cfg.iterations; i++) {
		const point = nextStep(cfg, points[i-1]);
		points[i] = point;
		bounds.expand(point);
	}

	for (let i = 0; i < points.length; i++) {
		points[i] = bounds.translate(points[i], cfg.result_size);
	}
	const counts: number[][] = new Array(cfg.result_size);
	for (let i = 0; i < cfg.result_size; i++) {
		counts[i] = new Array(cfg.result_size);
	}
	let maxCount = 0;
	for (const point of points) {
		const x = Math.floor(point.x);
		const y = Math.floor(point.y);
    if (!counts[x][y]) {
      counts[x][y] = 0;
    }
		counts[x][y]++;
		if (counts[x][y] > maxCount) {
			maxCount = counts[x][y];
		}
	}

  const canvas = createCanvas(cfg.result_size, cfg.result_size);
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, cfg.result_size, cfg.result_size);

	for (let i = 0; i < counts.length; i++) {
  	for (let j = 0; j < counts[i].length; j++) {
			const count = counts[i][j];
			if (!count) {
        imgData.data[j * (imgData.width * 4) + i * 4 + 3] = 255;
			} else {
				let pos = Math.sqrt(Math.sqrt(count / maxCount));
				let b = (pos*200) % 256 + 55;
				let g = ((1-pos)*200) % 256 + 55;
        imgData.data[j * (imgData.width * 4) + i * 4 + 1] = g;
        imgData.data[j * (imgData.width * 4) + i * 4 + 2] = b;
        imgData.data[j * (imgData.width * 4) + i * 4 + 3] = 255;
			}
		}
	}
  ctx.putImageData(imgData, 0, 0);
	return canvas;
}
