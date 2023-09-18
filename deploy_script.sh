#!/bin/bash

BUILD_FOLDER=dist

next build
sudo rm -rf $BUILD_FOLDER
sudo mkdir -p $BUILD_FOLDER
sudo mv .next/standalone/ $BUILD_FOLDER/
sudo mv node_modules $BUILD_FOLDER/
sudo cp -r .next/static $BUILD_FOLDER/.next
sudo cp -r .next/.next/required-server-files.json $BUILD_FOLDER/.next


sudo cp -r next.config.js $BUILD_FOLDER/
sudo cp -r next-i18next.config.js $BUILD_FOLDER/
sudo cp serverless.yml $BUILD_FOLDER/
sudo cp server.ts $BUILD_FOLDER/
sudo cp -r public $BUILD_FOLDER/
sudo cp -r components $BUILD_FOLDER/
sudo cp -r hooks $BUILD_FOLDER/
sudo cp -r pages $BUILD_FOLDER/
sudo cp -r public $BUILD_FOLDER/
sudo cp -r services $BUILD_FOLDER/
sudo cp -r styles $BUILD_FOLDER/
sudo cp -r types $BUILD_FOLDER/
sudo cp -r utils $BUILD_FOLDER/
sudo cd $BUILD_FOLDER
sudo sls deploy
