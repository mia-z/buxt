import { describe, it, expect } from "bun:test";
import { join } from "path";
import { cwd } from "process";
import ScanPaths from "src/utils/ScanPaths";

const root = join(cwd(), "__tests__", "routes");

describe("Route mapper tests", () => {
    it("will recursively fetch the paths of files inside the 'routes' folder", async () => {
        const paths: Array<RoutePath> = [ 
            { AbsolutePath: "messages.ts", FullPath: root + "/messages.ts", EffectiveRoute: "messages", },
            { AbsolutePath: "messages/[id].ts", FullPath: root + "/messages/[id].ts", EffectiveRoute: "messages/[id]" },
            { AbsolutePath: "messages/new_message.ts", FullPath: root + "/messages/new_message.ts", EffectiveRoute: "messages/new_message"  },
            { AbsolutePath: "user/[user]/[likes].ts", FullPath: root + "/user/[user]/[likes].ts", EffectiveRoute: "user/[user]/[likes]"  },
            { AbsolutePath: "user/[user].ts", FullPath: root + "/user/[user].ts", EffectiveRoute: "user/[user]"  }
        ];

        const routePaths = await ScanPaths(root, "");

        expect(JSON.stringify(routePaths)).toBe(JSON.stringify(paths));

        expect(routePaths.length).toBe(5);

        for (let x = 0; x < paths.length; x++) {
            expect(routePaths[x].FullPath).toBe(paths[x].FullPath);
        }

        for (let x = 0; x < paths.length; x++) {
            expect(routePaths[x].AbsolutePath).toBe(paths[x].AbsolutePath);
        }
    });
});
