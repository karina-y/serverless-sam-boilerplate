#!/usr/bin/env node
'use strict'

const fs = require('fs')
const exec = require('child_process').execSync
const modifyFiles = require('./utils').modifyFiles

let minimistHasBeenInstalled = false

if (!fs.existsSync('./node_modules/minimist')) {
  exec('npm install minimist --silent')
  minimistHasBeenInstalled = true
}

const args = require('minimist')(process.argv.slice(2), {
  string: [
	'account-id',
	'region',
	'app-name',
	'table-name',
	'endpoint-name',
  ],
  default: {
	region: 'us-east-1'
  }
})

if (minimistHasBeenInstalled) {
  exec('npm uninstall minimist --silent')
}

const accountId = args['account-id']
const region = args.region
const appName = args['app-name']
const tableName = args['table-name']
const endpointName = args['endpoint-name']

if (!accountId || accountId.length !== 12) {
  console.error('You must supply a 12 digit account id as --account-id="<accountId>"')
  process.exit(1)
}

if (!tableName) {
  console.error('You must supply a table name as --table-name="<tableName>"')
  process.exit(1)
}

if (!appName) {
  console.error('You must supply a app name as --app-name="<appName>"')
  process.exit(1)
}

if (!endpointName) {
  console.error('You must supply a endpoint name as --endpoint-name="<endpointName>"')
  process.exit(1)
}

modifyFiles(['./simple-proxy-api.yaml', './package.json', './cloudformation.yaml'], [{
  regexp: /YOUR_ACCOUNT_ID/g,
  replacement: accountId
}, {
  regexp: /YOUR_AWS_REGION/g,
  replacement: region
}, {
  regexp: /YOUR_APP_NAME/g,
  replacement: appName
}, {
  regexp: /YOUR_TABLE_NAME/g,
  replacement: tableName
}, {
  regexp: /YOUR_ENDPOINT_NAME_HERE/g,
  replacement: endpointName
}])
