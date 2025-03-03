# CrimeWarCounter

CrimeWarCounter is a tool for parsing images to detect and classify areas matching a target color. It uses various image processing techniques to identify and highlight regions of interest.

## Installation

To install the necessary dependencies, run:

```bash
npm i helldivers2-screenshots-analyzer
```

## Usage

Here's a simple example of how to use the `parseImage` function:

```javascript
import { parseImage } from './src/parseImage.js';

const options = {
    filename: 'example.png',
    label: 'example',
    sourcePath: './images/example.png',
    targetColor: { r: 255, g: 0, b: 0 }, // Red color
    colorTolerance: 45,
    debug: true,
    baseDebugPath: './debug'
};

parseImage(options).then(result => {
    console.log('Classification counts:', result);
}).catch(error => {
    console.error('Error processing image:', error);
});
```

## Options

- `filename`: The name of the file.
- `label`: The label for the image.
- `sourcePath`: The path to the source image.
- `targetColor`: The target color to detect in the image.
- `colorTolerance`: The tolerance for color matching (default: 45).
- `debug`: Whether to enable debug mode (default: false). If true, `baseDebugPath` should exist.
- `baseDebugPath`: Where debug images will be placed (default: "./debug").

## Debug Mode

When debug mode is enabled, intermediate images will be saved to the specified debug path, allowing you to visualize the processing steps.

## License

This project is licensed under the MIT License.
