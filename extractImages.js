import { readdirSync, statSync, existsSync } from 'fs';
import { cp, mkdir } from 'fs/promises';
import { join, extname } from 'path';

function extractImages() {
    const images = [];
    const debugPath = join('./debug');

    function traverseDirectory(currentPath) {
        const items = readdirSync(currentPath);

        items.forEach(item => {
            const fullPath = join(currentPath, item);
            const stats = statSync(fullPath);
            if (stats.isDirectory()) {
                traverseDirectory(fullPath);
            } else if (stats.isFile()) {
                // Check if filename includes '5' and its extension is in our list of image formats.
                if (item.endsWith(".5.highlight.png")) {
                    images.push(fullPath);
                }
            }
        });
    }

    if (existsSync(debugPath) && statSync(debugPath).isDirectory()) {
        traverseDirectory(debugPath);
    } else {
        console.error(`Folder "debug" does not exist at ${debugPath}`);
    }

    return images;
}

// Example usage:
const paths = extractImages();
console.log('Extracted image files:', paths);

await mkdir('./output', { recursive: true });

for (const path of paths) {
    const filename = path.split('\\').at(-1);
    const imageName = path.split('\\').at(-2);
    await cp(path, join('./output', `${imageName}_${filename}`), { recursive: true });
}

// Export the function if needed
export default extractImages;
