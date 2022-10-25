# Contributing

Contributions are very much welcome! 

## Workflow Summary

1. Fork [this repo](https://github.com/daveschumaker/artbot-for-stable-diffusion/fork)
2. Create a [namespaced branch](https://gist.github.com/seunggabi/87f8c722d35cd07deb3f649d45a31082) from the `main` branch, based on what you'd like to work on. e.g., `fix/submit-btn`, `feat/add-img2img`, etc.
  - `feat/...` or `feature/...`: (new feature for the user, not a new feature for build script)
  - `fix/...`: (bug fix for the user, not a fix to a build script)
  - `docs/...`: (changes to the documentation)
  - `style/...`: (formatting, missing semi colons, etc; no production code change)
  - `refactor/...`: (refactoring production code, eg. renaming a variable)
  - `test/...`: (adding missing tests, refactoring tests; no production code change)
  - `chore/...`: (updating webpack tasks etc; no production code change)
3. Make commits to your feature branch, preferably using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `feat: added a new feature`
  - `fix: fix inconsistent tests [fixes #0]`
  - `refactor: ...`
  - `chore: ...`
  - `test: ...`
  - `doc: ...`
  - See further examples [here](https://www.conventionalcommits.org/en/v1.0.0/#summary)
4. When you've finished with your fix or feature, rebase upstream changes into your branch and then submit a [pull request](https://github.com/daveschumaker/artbot-for-stable-diffusion/compare) directly to `main`. Include a description of your changes.
5. Your pull request will be reviewed by another maintainer. The point of code reviews is to help keep the codebase clean and of high quality and, equally as important, to help you grow as a programmer. If your code reviewer requests you make a change you don't understand, ask them why.
6. Fix any issues raised by your code reviewer, and push your fixes as a new commit.
7. Once the pull request has been reviewed, it will be merged by another member of the team. Do not merge your own commits.

### Guidelines

1. Uphold the current code standard:
    - Keep your code [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).
    - Apply the [boy scout rule](http://programmer.97things.oreilly.com/wiki/index.php/The_Boy_Scout_Rule).
2. Run any tests (if applicable) before submitting a pull request.

## Checklist:

This is just to help you organize your process

- [ ] Did I cut my work branch off of `main`?
- [ ] Did I follow the correct naming convention for my branch?
- [ ] Is my branch focused on a single main change?
 - [ ] Do all of my changes directly relate to this change?
- [ ] Did I rebase the upstream `main` branch after I finished all my
  work?
- [ ] Did I write a clear pull request message detailing what changes I made?
- [ ] Did I get a code review?
 - [ ] Did I make any requested changes from that code review?

If you follow all of these guidelines and make good changes, you should have
no problem getting your changes merged in.
