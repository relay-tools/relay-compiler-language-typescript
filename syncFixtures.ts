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
      .forEach(file => {
        try {
          fs.copyFileSync(
            path.join(__dirname, `${cwd}/${file}`),
            `${dest}/${file}`
          );
          console.log(`${file} was copied`);
        } catch (error) {
          console.error(error);
        }
      });
  });
};

const souceFilePaths = [
  {
    cwd:
      "../relay/packages/relay-compiler/language/javascript/__tests__/fixtures/flow-generator/useHaste",
    pattern: "*.graphql"
  }
];

syncFixtures({ souceFilePaths, dest: "./test/fixtures/type-generator" });
