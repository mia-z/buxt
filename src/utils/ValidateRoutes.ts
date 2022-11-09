import { Transpiler } from "bun";
import { Route, RoutePath, ValidateRoute } from "index.d";

const transpiler = new Transpiler({ loader: "ts" });


/**
 * Function which validates routes that were found previously.
 * Makes sure they adhere to the correct rules of the application, otherwise throws an error
 * @date 11/5/2022 - 11:50:56 PM
 *
 * @async
 * @param {RoutePath} path - the {RoutePath} to validate
 * @returns {(Promise<Route | never>)} - {Route} object containing successfully validated files which adhere to the rules of the application (a valid path and a valid exported default function)
 */
const validateRoute: ValidateRoute = async (path: RoutePath): Promise<Route | never> => {
    const isTsExtension = path.FullPath.split(".")[path.FullPath.split(".").length - 1] === "ts";
    if (!isTsExtension) {
        throw new Error("Module must be a Typescript file", { cause: `${path} does not point to a Typescript file` });
    }

    const loadedFile = await Bun.file(path.FullPath);
    const fileContents = await loadedFile.text();
    const transpiled = await transpiler.scan(fileContents);
    if (!transpiled.exports.includes("default")) {
        throw new Error("Route must have only a default export (for now)", { cause: `${path.FullPath} does not have a default export` });
    }
    if (transpiled.exports.length > 1) {
        throw new Error("Route must have only a single export that is default (for now)", { cause: `${path.FullPath} exports more than just default` });
    }
    if (typeof require(path.FullPath).default !== "function") {
        throw new Error("Route must export a default function", { cause: `${path.FullPath} default export is not a function` });
    }

    const parts = path.AbsolutePath.split(".");
    if (parts.length > 2) {
        throw new Error("Route must not have more than one dot(.) in them", { cause: `${path.FullPath} has more than 1 dot(.)` });
    }
    if (parts[1] !== "ts") {
        throw new Error("Route file must be a Typescript file (or the .ts extension)", { cause: `${path.FullPath} has the extension: ${parts[1]} - or something that ISNT .ts` });
    }

    //const params = parts[0].match(/(?<=\[)(.*?)(?=\])/g);

    return {
        route: parts[0],
        routeParameters: {},
        delegate: require(path.FullPath).default
    };
}

export default validateRoute;