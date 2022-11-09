import { statSync, existsSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { Route, RoutePath, ScanPaths } from "index.d";
import { cwd } from "process";


/**
 * Function which recursively scans directories and children for Typescript files that export a default function
 * @date 11/5/2022 - 11:48:56 PM
 *
 * @async
 * @param {string} basePath - the base filesystem path where the routes are located. By default this is <project-root>/routes
 * @param {string} currentPath - the current path being recursed
 * @returns {Promise<Array<RoutePath>>} - array of {RoutePath} containing data about scanned directory
 * @remarks This could probably be split into 2 functions to make it slightly faster?
 * - 1 function as the main, and 1 recurse function which just does the directory scanning
 */
const ScanPaths: ScanPaths = async (basePath: string, currentPath: string): Promise<Array<RoutePath>> => {
    try {
        let paths: RoutePath[] = [];
        let files: string[];

        let thisPath = join(cwd(), basePath, currentPath);
        if (!thisPath) {
            throw new Error(`Cant make routes in the given path\nTried joining basePath:${basePath} and currentPath:${currentPath}`);
        }

        //TODO: This feels really dirty, but I can't think of something simpler right now.
        //This is just meant to exhaust the 2 default paths (routes and src/routes) if a custom route root is not given in the config.
        if (basePath === "routes") {
            const rootExists = existsSync(thisPath);
            console.log(rootExists);
            if (!rootExists) {
                return await ScanPaths("src/routes", "");
            } else if (rootExists) { 
                //Fallthrough
            } else {
                throw new Error(`Root path error`);
            }
        }

        try {
            files = await readdir(thisPath);
        } catch (e) {
            throw new Error(`Error reading the directory: ${thisPath} -- ${e.message}`);
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