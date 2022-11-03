import { statSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { Route, RoutePath, ScanPaths } from "buxt";

const ScanPaths: ScanPaths = async (basePath: string, currentPath: string): Promise<Array<RoutePath>> => {
    let paths: RoutePath[] = [];
    let thisPath = join(basePath, currentPath);
    const files = await readdir(thisPath);
    for (const file of files) {
        const fullPath = join(thisPath, file);
        const fileStats = statSync(fullPath);
        if (await fileStats.isDirectory()) {
            const deeperPaths = await ScanPaths(basePath, join(currentPath, file));
            paths = [...paths, ...deeperPaths];
        } else {
            paths.push({ 
                AbsolutePath: join(currentPath, file), 
                FullPath: join(basePath, currentPath, file)
            });
        }
    }
    return paths;
}

export default ScanPaths;