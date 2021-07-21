if [ ! -z "$TRAVIS_BRANCH" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  npx auto@v10.24.1 shipit -v
else
  echo "Not on master, skipping deploy"
fi
