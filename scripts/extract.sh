#!/usr/bin/env bash

for filePath in $(find -E /Users/jonathansiebern/git/_fork/material-ui/src -regex '^.*[A-Z][a-z]*\.js')
do
    # Make sure that we don't use internal components
    if ! grep -q "@ignore - internal component" "$filePath"; then
        # Get Original Filename
        fullFileName=$(basename "$filePath")
        fileName="${fullFileName%.*}"
        fileName="${fileName%.*}"

        # Get Original File Path
        findInPath="/Users/jonathansiebern/git/_fork/material-ui/src"
        pathWithoutRoot="${filePath/$findInPath/}"
        pathWithoutRoot="${pathWithoutRoot/$fullFileName/}"
        pathWithoutRootAndFile=$pathWithoutRoot
        pathWithoutRootAndFile+=$fileName
        pathWithoutRootAndFile+=".json"

        # Don't include the index files
        if ! [[ $pathWithoutRootAndFile == *"index"* ]]; then
            outPath="output/"
            outPath+=$pathWithoutRoot
            mkdir -p $outPath
            react-docgen $filePath -o output/$pathWithoutRootAndFile
        fi

    fi
done
