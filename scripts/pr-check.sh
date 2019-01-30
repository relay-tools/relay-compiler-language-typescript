if [ ! -z "$TRAVIS_PULL_REQUEST" ] && [ "$TRAVIS_PULL_REQUEST" != "false" ] && [ ! -z "$TRAVIS_JOB_WEB_URL" ]; then
  npx auto pr-check --pr $TRAVIS_PULL_REQUEST --url $TRAVIS_JOB_WEB_URL
else
  echo "Not on a PR, skipping PR check"
fi
