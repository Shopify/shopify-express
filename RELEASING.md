1. Merge your branch into master
2. Run `npm version [version]` which will do the following:
  * write new version to package.json
  * create a new commit with a commit message matching the version number
  * create a new tag matching the version number
3. Push the new commit and tags to master with `git push origin master --tags`
4. Create a release on Github. Include a change log in the description
5. Deploy via Shipit
