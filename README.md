# Helldivers 2 Screenshots Analyzer

A utility for analyzing screenshots from the game Helldivers 2 and identifying key elements by color detection.

Find and count every completed primary and secondary missions

![Detected missions](https://github.com/wlp2s0/war-crime-counter/blob/main/static/missions.png?raw=true)


## Installation

```bash
npm install helldivers2-screenshots-analyzer
```

## Usage

```javascript

import { parseImage } from 'helldivers2-screenshots-analyzer';

const primaryParseResult = await parseImage({
  filename: 'screenshot1',
  label: 'mission-icons',
  sourcePath: 'https://raw.githubusercontent.com/wlp2s0/war-crime-counter/d21873b269f555d599977210f87e18aa7663b89f/test/fixtures/0_3_5.png',
  targetColor: { r: 255, g: 135, b: 36, tolerance: 32 }
});

const secondaryParseResult = await parseImage({
  filename: 'screenshot1',
  label: 'mission-icons',
  sourcePath: 'https://raw.githubusercontent.com/wlp2s0/war-crime-counter/d21873b269f555d599977210f87e18aa7663b89f/test/fixtures/0_3_5.png',
  targetColor: { r: 113, g: 245, b: 255, tolerance: 42 }
});

console.log({ primaryMissions: primaryParseResult.success, secondaryMissions: secondaryParseResult.success });
/*
Expected output:
{ primaryMissions: 3, secondaryMissions: 5 }
*/

```

## API Reference

### parseImage(options)

Parses an image to detect and classify areas matching a target color.

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filename` | `string` | *Required* | Name of the file to be parsed |
| `label` | `string` | *Required* | Label used for debugging and console output |
| `sourcePath` | `string` | *Required* | Full path to the source image, it can either be a local fs path or an url |
| `targetColor` | `TargetColour` | *Required* | The target color to detect in the image |
| `minMergeThresholdRatio` | `number` | `0.001` | Minimum threshold ratio for merging detected regions |
| `maxMergeThresholdRatio` | `number` | `0.4` | Maximum threshold ratio for merging detected regions |
| `minWidthThresholdRatio` | `number` | `0.015` | Minimum threshold ratio for detected region width |
| `minHeightThresholdRatio` | `number` | `0.015` | Minimum threshold ratio for detected region height |
| `maxWidthThresholdRatio` | `number` | `0.14` | Maximum threshold ratio for detected region width |
| `maxHeightThresholdRatio` | `number` | `0.14` | Maximum threshold ratio for detected region height |
| `allowedBoxProportion` | `number` | `3` | Proportion threshold for width/height ratio |
| `cropRatioWidth` | `number` | `0.275` | Width ratio for cropping the image |
| `cropRatioHeight` | `number` | `0.35` | Height ratio for cropping the image |
| `noiseThresholdPercentage` | `number` | `7.5` | Percentage threshold for noise detection |
| `plainColorThresholdPercentage` | `number` | `90` | Percentage threshold for plain color detection |
| `marginThresholdRatio` | `number` | `0.005` | Margin threshold ratio for detected regions |
| `yCropOffsetRatio` | `number` | `0.025` | Vertical offset ratio for cropping |
| `debug` | `boolean` | `false` | Enable debug mode to save intermediate images |
| `baseDebugPath` | `string` | `"./debug"` | Base path for saving debug images |

#### Returns

```typescript
{
  success: number, // Count of successfully detected icons
  plain: number,   // Count of plain color boxes
  small: number,   // Count of boxes that are too small
  big: number,     // Count of boxes that are too large
  noisy: number,   // Count of noisy boxes
  abnormal: number // Count of boxes with abnormal proportions
}
```

## TypeScript Types

The package includes TypeScript declarations for all exported functions and types.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

## License

[MIT](LICENSE)