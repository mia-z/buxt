import { statSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { Route, RoutePath, ScanPaths } from "index.d";


/**
 * Function which recursively scans directories and children for Typescript files that export a default function
 * @date 11/5/2022 - 11:48:56 PM
 *
 * @async
 * @param {string} basePath - the base filesystem path where the routes are located. By default this is <project-root>/routes
 * @param {string} currentPath - the current path being recursed
 * @returns {Promise<Array<RoutePath>>} - array of {RoutePath} containing data about scanned directory information
 */
const ScanPaths: ScanPaths = async (basePath: string, currentPath: string): Promise<Array<RoutePath>> => {
    try {
        let paths: RoutePath[] = [];
        let files: string[];

        let thisPath = join(basePath, currentPath);
        if (!thisPath) {
            throw new Error(`Cant make routes in the given path\nTried joining basePath:${basePath} and currentPath:${currentPath}`);
        }
        try {
            files = await readdir(thisPath);
        } catch (e) {
            throw new Error(`Couldnt find any valid routes under the given path: ${thisPath}`);
        }
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
    } catch (e) {
        throw new Error(e);
    }
    
}

export default ScanPaths;