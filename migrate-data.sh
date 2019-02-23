#!/bin/bash

if [ -z ${1} ]
then
  echo "Data migration failed!"
  echo "Pass your accessKeyId as the first argument"

fi

if [ -z ${2} ]
then 
echo "Data migration failed!"
echo "Pass your secretAccessKey as the second argument"

fi

set -eu

ACCESS_KEY=${1} SECRET_KEY=${2} TABLE_EXPORT=DynamodbExportTable TABLE_IMPORT=DynamoDbImportTable node ./within-account-migration.js 
