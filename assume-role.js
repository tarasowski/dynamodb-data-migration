const AWS = require('aws-sdk')
const sts = new AWS.STS({accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY})

const constrParams = () => ({
  RoleArn: 'xxxxx',
  RoleSessionName: 'Dimitri'
})

const callAssumeRoleService = params => 
    sts.assumeRole(params).promise()
        .catch(e => {
          throw new Error(e)
        })


const assumeRole = callAssumeRoleService(constrParams())
                      .then(data => ({accessKeyId: data.Credentials.AccessKeyId, secretAccessKey: data.Credentials.SecretAccessKey, sessionToken: data.Credentials.SessionToken}))

module.exports = {assumeRole}
