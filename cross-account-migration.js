const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1', accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY })
const {assumeRole} = require('./assume-role.js')
const {splitEvery} = require('ramda')
const {asyncPipe} = require('compose.helpers')

const TABLE_EXPORT = process.env.TABLE_EXPORT 
const TABLE_IMPORT = process.env.TABLE_IMPORT 


const constructParamsScan = (tableName = TABLE_EXPORT) => ({
  TableName: tableName,
})

const getCrossAccountAccess = async items => ({items, keys: await assumeRole})

const initNewDynamoDbClient = async ({items, keys: {accessKeyId, secretAccessKey, sessionToken}}) => ({
  items,
  dynamodbImport: new AWS.DynamoDB.DocumentClient({region: 'eu-central-1', accessKeyId, secretAccessKey, sessionToken})
})

const convertItemsToPromises = async ({items, dynamodbImport}) => 
  items.map(params => dynamodbImport.batchWrite(params).promise().catch(e => console.log(e)))

const splitForWrites = (tableName = TABLE_IMPORT) => async ({items, ...rest}) => ({
  items: splitEvery(24, items).map(e => ({
    RequestItems: {
      [tableName]: e.map(i => ({
        PutRequest: {Item: {...i}}
      }))
    }})),
  ...rest
})

const onScan = (resolve, reject) => (params = constructParamsScan()) => items =>(err, data) => 
    err
      ? reject(err)
      : data.LastEvaluatedKey
        ? (
            dynamodb.scan({...params, ExclusiveStartKey: data.LastEvaluatedKey},
            onScan(resolve, reject)()([...items, ...data.Items])), console.log('Scanning for more...')
          )
        : !data.LastEvaluatedKey
          ? resolve([...items, ...data.Items])
          : reject('Something went wrong with reading data from db')

const scanDatabase = () =>
  new Promise((resolve, reject) =>
    dynamodb.scan(constructParamsScan(), onScan(resolve, reject)()([]))    
  )

const migration = asyncPipe(
  scanDatabase,
  getCrossAccountAccess,
  initNewDynamoDbClient,
  splitForWirtes(),
  convertItemsToPromises
)


migration()
  .then(xs => Promise.all(xs))
  .then(() => console.log('Data was successfully migrated'))
  .catch(e => {
      throw new Error(e)
})
