import type { Canvas } from 'canvas';
import type { Config } from './algo';
import { run } from './algo';
import * as fs from 'fs';

if (!process.env.ABOUND_CONFIG_PATH) {
  console.log('no ABOUND_CONFIG_PATH was specified');
  process.exit(1);
}
if (!process.env.ABOUND_OUTPUT_PATH) {
  console.log('no ABOUND_OUTPUT_PATH was specified');
  process.exit(1);
}

const config: Config = JSON.parse(fs.readFileSync(process.env.ABOUND_CONFIG_PATH, 'utf8'));

const canvas: Canvas = run(config);

const out = fs.createWriteStream(process.env.ABOUND_OUTPUT_PATH);
const stream = canvas.createPNGStream();
stream.pipe(out);
(async () => {
  await new Promise((resolve) => {
    out.on('finish', resolve)
  })
})();