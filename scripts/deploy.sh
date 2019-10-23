if [ ! -z "$TRAVIS_BRANCH" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  npx auto shipit $AUTO_OPTS
else
  echo "Not on master, skipping deploy"
fi
