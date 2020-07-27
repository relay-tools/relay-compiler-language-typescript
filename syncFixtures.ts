import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";

type SyncFixturesType = {
  souceFilePaths: Array<{
    cwd: string;
    pattern: string;
  }>;
  dest: string;
};

const syncFixtures = ({ souceFilePaths, dest }: SyncFixturesType) => {
  souceFilePaths.forEach(({ cwd, pattern }) => {
    glob
      .sync(pattern, {
        cwd
      })
      .forEach(filePath => {
        const file = getFileNameFromPath(filePath);
        try {
          fs.copyFileSync(
            path.join(__dirname, `${cwd}/${filePath}`),
            `${dest}/${file}`
          );
          console.log(`${filePath} was copied`);
        } catch (error) {
          console.error(error);
        }
      });
  });
};

const getFileNameFromPath = (filePath: string) => filePath.split("/").pop();

const souceFilePaths = [
  {
    cwd:
      "../relay/packages/relay-compiler/language/javascript/__tests__/fixtures/flow-generator",
    pattern: "**/*.graphql"
  }
];

syncFixtures({ souceFilePaths, dest: "./test/fixtures/type-generator" });
