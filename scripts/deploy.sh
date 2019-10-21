if [ ! -z "$TRAVIS_BRANCH" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  git config --local user.name "${GIT_NAME}"
  git config --local user.email "${GIT_EMAIL}"
  git remote rm origin
  git remote add origin https://${GH_USER}:${GH_TOKEN}@github.com/relay-tools/relay-compiler-language-typescript.git

  npx auto shipit $AUTO_OPTS
else
  echo "Not on master, skipping deploy"
fi
