#!/bin/bash
# Author: Dimitri Tarasowski
# Date created: 03/11/2019
# Date updated: 04/11/2019
# Description: A script to migrate data from DynamoDB tables.

echo 'Please choose an option:'
OPTIONS="WithinAccount CrossAccount"
APPROVAL="YES NO"
select opt in $OPTIONS; do
  if [ "$opt" = "WithinAccount" ]; then
    echo 'Please provide the name of the EXPORT TABLE:'
    read export_table
    echo 'Please provide the name of the IMPORT TABLE:'
    read import_table
    while true; do
      read -p "Are you sure you want to EXPORT data from $export_table and IMPORT to $import_table? [yes/no]: " yn
      case $yn in
        [Yy]* ) TABLE_EXPORT=$export_table TABLE_IMPORT=$import_table node ./within-account-migration.js; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
      esac
    done
    exit
  elif [ "$opt" = "CrossAccount" ]; then
      echo 'Please provide the name of the EXPORT TABLE:'
      read export_table
      echo 'Please provide the name of the IMPORT TABLE:'
      read import_table
      echo 'Please provide AWS Access Key from the import account'
      read access_key
      echo 'Please provide AWS Secret Key from the import account'
      read secret_key
      while true; do
        read -p "Are you sure you want to EXPORT data from $export_table and IMPORT to $import_table? [yes/no]: " yn
        case $yn in
          [Yy]* ) ACCESS_KEY=$access_key SECRET_KEY=$secret_key TABLE_EXPORT=$export_table TABLE_IMPORT=$import_table node ./within-account-migration.js; break;;
          [Nn]* ) exit;;
          * ) echo "Please answer yes or no.";;
        esac
      done
      exit
  else
    clear
    echo "bad option"
  fi
done

