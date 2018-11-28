#!/bin/bash
pwd=$(pwd)
cd ../../_fork/material-ui; npx typescript-json-schema ./tsconfig.json Theme --ignoreErrors --excludePrivate --required -o "${pwd}/../output/json/theme.json"
cd ../../_fork/material-ui; npx typescript-json-schema ./tsconfig.json ThemeOptions --ignoreErrors --excludePrivate --required -o "${pwd}/../output/json/theme-options.json"
cd "${pwd}"