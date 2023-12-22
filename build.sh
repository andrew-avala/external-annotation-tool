#!/bin/bash

echo "Building Meteor app..."
meteor build ./electron --architecture os.osx.x86_64

TAR_FILE="./electron/external-annotation-tool.tar.gz"

echo "Clearing previous bundle..."
rm -rf ./electron/bundle

if [ -f "$TAR_FILE" ]; then
    echo "Extracting new bundle..."
    # Extract the tar file directly inside the 'electron' directory
    tar -xzf "$TAR_FILE" -C ./electron

    echo "Removing tar file..."
    # Remove the tar file after extraction
    rm -f "$TAR_FILE"
else
    echo "Error: Tar file not found: $TAR_FILE"
    exit 1
fi

cd "./electron/bundle/programs/server"
npm install


echo "Build and extraction completed."
