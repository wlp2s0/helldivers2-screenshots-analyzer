import { readdirSync, statSync, renameSync } from 'fs';
import { join, extname } from 'path';

function renameScreenshots(screenshotsDir) {
    const items = readdirSync(screenshotsDir);
    const files = items.filter(item => {
        const fullPath = join(screenshotsDir, item);
        return statSync(fullPath).isFile();
    });
    files.sort();

    files.forEach((oldName, idx) => {
        const newBase = idx.toString().padStart(4, '0');
        const ext = extname(oldName);
        const newName = `${newBase}${ext}`;
        const oldPath = join(screenshotsDir, oldName);
        const newPath = join(screenshotsDir, newName);
        renameSync(oldPath, newPath);
        console.log(`Renamed '${oldName}' to '${newName}'`);
    });
}

const screenshotsDirectory = join("./", 'screenshots');
renameScreenshots(screenshotsDirectory);
