# Development Guide

## Git Submodules

The `src/jquery.pointerHooks` directory is pointing to a separate repo.

After a fresh clone this project, it is necessary to run the following commands from the project root
to pull in this repo:

    git submodule init
    git submodule update

## Grunt Builds

The project cannot be run directly from the source code -- it must be built before running in the browser.
To build the project, run the following commands from the project root:

    npm install
    grunt