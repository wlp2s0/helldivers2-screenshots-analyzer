# Helldivers 2 Screenshots Analyzer

A utility for analyzing screenshots from the game Helldivers 2 and identifying key elements by color detection.

## Installation

```bash
npm install helldivers2-screenshots-analyzer
```

## Usage

```javascript
import { parseImage } from 'helldivers2-screenshots-analyzer';

// Example usage
const results = await parseImage({
  filename: 'screenshot1',
  label: 'mission-icons',
  sourcePath: './screenshots/screenshot1.jpg',
  targetColor: { r: 255, g: 204, b: 0, tolerance: 30 }
});

console.log(results);
```

## API Reference

### parseImage(options)

Parses an image to detect and classify areas matching a target color.

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filename` | `string` | *Required* | Name of the file to be parsed |
| `label` | `string` | *Required* | Label used for debugging and console output |
| `sourcePath` | `string` | *Required* | Full path to the source image |
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