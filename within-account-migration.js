const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'eu-central-1'})
const {splitEvery} = require('ramda')
const {asyncPipe} = require('compose.helpers')

const TABLE_EXPORT = process.env.TABLE_EXPORT 
const TABLE_IMPORT = process.env.TABLE_IMPORT 

const constructParamsScan = (tableName = TABLE_EXPORT) => ({
  TableName: tableName,
})

const convertItemsToPromises = async ({items}) => 
  items.map(params => dynamodb.batchWrite(params).promise().catch(e => console.log(e)))

const splitForWrites = (tableName = TABLE_IMPORT) => async ({items}) => ({
  items: splitEvery(24, items).map(e => ({
    RequestItems: {
      [tableName]: e.map(i => ({
        PutRequest: {Item: {...i}}
      }))
    }})),
})

const onScan = (resolve, reject) => (params = constructParamsScan()) => items => (err, data) => 
    err
      ? reject(err)
      : data.LastEvaluatedKey
        ? (
            dynamodb.scan({...params, ExclusiveStartKey: data.LastEvaluatedKey},
            onScan(resolve, reject)()([...items, ...data.Items])), console.log('Scanning for more...')
          )
        : !data.LastEvaluatedKey
          ? resolve({items: [...items, ...data.Items]})
          : reject('Something went wrong with reading data from db')

const scanDatabase = () =>
  new Promise((resolve, reject) =>
    dynamodb.scan(constructParamsScan(), onScan(resolve, reject)()([]))    
  )

const migration = asyncPipe(
  scanDatabase,
  splitForWrites(),
  convertItemsToPromises
)

const timeoutPromise = p =>
    p.then(x => console.log('Saving items to the target database...'), e => console.log('error: ', e))

migration()
  .then(xs => 
    xs.forEach((e, i, a) => 
      setTimeout(() => 
        timeoutPromise(e), (500 * (i + 2)))))
  .catch(e => {
      throw new Error(e)
})
