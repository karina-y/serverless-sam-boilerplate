### customized template based off sam so i can get up and running quick exactly how i want it
### this does all the sam shit plus creates a table with a lambda function that sends an email and updates a record on the table on insert and i think some other stuff idk i don't remember
### also usable with amplify hosting/publishing/whatever


# usage and implementation notes

## important things you may need in debugging processes

- s3 bucket name
   > ex: notes-app-uploads

- dynamodb table name
    > ex: notes
- dynamodb partition and sort keys
    > ex: userId and noteId
- dynamodb arn
    > ex: arn:aws:dynamodb:us-east-1:232771854781:table/notes
- dynamodb stream arn

- cognito user pool name
    > ex: notes-user-pool
- cognito user pool id
    > ex: us-east-1_XNvE8Ack3
- cognito user pool arn
   >  ex: arn:aws:cognito-idp:us-east-1:232771854781:userpool/us-east-1_XNvE8Ack3

- app client name
    > ex: notes-app
- app client id
    > ex: 3b9q8192501ngmuc2ilaurvcgf

- domain name prefix
    > ex: notes-app
- domain name url
    > ex: https://notes-app.auth.us-east-1.amazoncognito.com

- api gateway id
    > ex: ly55wbovq4
- api gateway endpoint
    > ex: https://ly55wbovq4.execute-api.us-east-1.amazonaws.com/prod/notes

- federated identity pool name
    > ex: notes identity pool
- federated identity pool id
    > ex: us-east-1:3eb9653f-e567-4dba-8a85-a0c7c3e390a3
- federated identity pool arn
    > ex: arn:aws:cognito-identity:us-east-1:232771854781:identitypool/us-east-1:2acf9126-92wi-4173-bf74-62h39c1783z6

- IAM role name
    > ex: Cognito_notesAuth_Role



## TESTING LOCALLY
> ```sam local start-api```
   > as this is running you can use postman to test endpoints live while editing
   > ex: http://127.0.0.1:3000/note


## SAM CLI - initial setup
- ctrl shft f for any REPLACE_ occurences
- will need region and account id to continue

- in /backend run these
```npm run config -- --account-id="REPLACE_ACCOUNT_ID_HERE" --app-name="REPLACE_APP_NAME_HERE" --table-name="REPLACE_YOUR_TABLE_NAME_HERE>" --endpoint-name="REPLACE_YOUR_ENDPOINT_NAME_HERE>" [--region="<REGION_HERE>"]```
> check cloudFormation.yaml and simple_proxy_api.yaml to ensure the config took
> /backend/package.json config should now be customized

- update all #TODO UPDATE_THIS instances across backend
- also check that all account id's are updated
> ```npm run deploy-email-templates```
> ```> npm run setup```
- see the debugging section below for troubleshooting

- edit /client/package.json start scripts to include your endpoint (from api gateway > <YOUR_API_NAME_HERE>)
```
"scripts": {
       "start": "REACT_APP_API_ROOT='https://REPLACE_ENDPOINT_ID_HERE.execute-api.YOUR_AWS_REGION.amazonaws.com/REPLACE_STAGE_HERE' react-scripts start",
       "build": "REACT_APP_API_ROOT='https://REPLACE_ENDPOINT_ID_HERE.execute-api.YOUR_AWS_REGION.amazonaws.com/REPLACE_STAGE_HERE' react-scripts build",
       "test": "REACT_APP_API_ROOT='https://REPLACE_ENDPOINT_ID_HERE.execute-api.YOUR_AWS_REGION.amazonaws.com/REPLACE_STAGE_HERE' react-scripts test",
       "eject": "REACT_APP_API_ROOT='https://REPLACE_ENDPOINT_ID_HERE.execute-api.YOUR_AWS_REGION.amazonaws.com/REPLACE_STAGE_HERE' react-scripts eject"
     }
```


### edit roles
- enable Cloudwatch logging api gateway > api > stages > prod/stage > logs/tracing > enable cloudwatch logs for info and log details
    - NOTE this may need to be repeated upon each deployment :/
    - to debug api calls go to cloudwatch > logs >


### TO CREATE EMAIL ON INSERT TRIGGER
- this is automated in npm run setup hollaaaaaaa
- see the debugging section below for troubleshooting

- to create email template
> ```aws ses create-template --cli-input-json file://FILE_NAME.json```
> ```npm run deploy-email-templates```

- to update email template
> ```aws ses update-template --cli-input-json file://FILE_NAME.json```
> ```npm run update-email-templates```

- to delete email template
> ```aws ses delete-template --template-name TEMPLATE_NAME```



## Deployment Notes
- ensure no package.jsons are exposed!!

## Debugging
- endpoints all live in /backend/app.js
- deployment scripts live in /backend/package.json (all we use is npm run config and npm run setup)
- if any issues arise with the initial npm run setup the culprit is between /backend/cloudformation.yaml, /backend/simple-proxy-api.yaml, or /backend/template.yaml
- to debug the ```npm run setup``` process
    navigate to cloudformation > stack > view events
        - if it's stuck in UPDATE_ROLLBACK_FAILED, click other actions > continue update rollback
        - if that still doesn't work you'll need to delete the stack and rerun ```npm run setup```
        - if it's in ROLLBACK_COMPLETE the setup will fail and you'll need to delete the stack and rerun ```npm run setup```
- to debug api calls go to cloudwatch > logs > AwsServerlessExpressStack-<YOUR_APP_NAME_NAME_HERE>BackendLambda
- to debug lambda function navigate to cloudwatch logs > /aws/lambda/DESIRED_FUNCTION > latest stream
    - alternatively navigate to lambda > DESIRED_FUNCTION > monitoring > view logs in cloudwatch

### More resources for debugging
- sam cli docs https://github.com/awslabs/serverless-application-model/blob/develop/versions/2016-10-31.md#awsserverlessapi

## etc/need to sort through
- to enable api keys follow this https://datanextsolutions.com/blog/protect-aws-api-gateway-endpoints-using-api-keys/
- to invoke a lambda from another https://stackoverflow.com/questions/31714788/can-an-aws-lambda-function-call-another
- lambda best practices https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html






### sample data for testing
JSON
{
  "id": "REPLACE_ID_HERE",
  "REPLACE_DATA_FIELD_HERE": "REPLACE_DATA_VALUE_HERE",
  "REPLACE_DATA_FIELD_2_HERE": [
    "REPLACE_DATA_VALUE_2_HERE"
  ]
}


dynamoJSON
{
  "id": {
    "S": "REPLACE_ID_HERE"
  },
  "REPLACE_DATA_FIELD_HERE": {
      "S": "REPLACE_DATA_VALUE_HERE"
    },
  "REPLACE_DATA_FIELD_2_HERE": {
    "L": [
      {
        "S": "REPLACE_DATA_VALUE_2_HERE"
      }
    ]
  }
}


### lambda test post function
{
  "Records": [
    {
      "eventID": "1",
      "eventVersion": "1.0",
      "dynamodb": {
        "Keys": {
          "id": {
            "N": "REPLACE_DUMMY_ID_HERE"
          }
        },
        "NewImage": {
		  "id": {
			"S": "REPLACE_DUMMY_ID_HERE"
		  },
		  "REPLACE_DATA_FIELD_HERE": {
			"S": "REPLACE_DATA_VALUE_HERE"
		  },
		  "REPLACE_DATA_FIELD_2_HERE": {
			"L": [
			  {
				"S": "REPLACE_DATA_VALUE_2_HERE"
			  }
			]
		  }
        },
        "StreamViewType": "NEW_AND_OLD_IMAGES",
        "SequenceNumber": "111",
        "SizeBytes": 26
      },
      "awsRegion": "us-west-2",
      "eventName": "INSERT",
      "eventSourceARN": "arn:aws:dynamodb:YOUR_AWS_REGION:YOUR_ACCOUNT_ID:table/YOUR_TABLE_NAME/stream/REPLACE_TABLE_STREAM_HERE",
      "eventSource": "aws:dynamodb"
    }
  ]
}























# stock readme
## Example

In addition to a basic Lambda function and Express server, the `example` directory includes a [Swagger file](http://swagger.io/specification/), [CloudFormation template](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) with [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model), and helper scripts to help you set up and manage your application.

### Steps for running the example
This guide assumes you have already [set up an AWS account](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html) and have the latest version of the [AWS CLI](https://aws.amazon.com/cli/) installed.

1. From your preferred project directory: `git clone https://github.com/awslabs/aws-serverless-express.git && cd aws-serverless-express/examples/basic-starter`.
2. Run `npm run config -- --account-id="<REPLACE_ACCOUNT_ID_HERE>" [--region="<REPLACE_REGION_HERE>" --app-name="<REPLACE_APP_NAME_HERE___NO_SPACES> --table-name="<REPLACE_TABLE_NAME_HERE>"]` to configure the example, eg. `npm run config -- --account-id="123456789012" --bucket-name="my-unique-bucket"`. This modifies `package.json`, `simple-proxy-api.yaml` and `cloudformation.yaml` with your account ID, bucket, region and function name (region defaults to `us-east-1` and function name defaults to `AwsServerlessExpressFunction`). If the bucket you specify does not yet exist, the next step will create it for you. This step modifies the existing files in-place; if you wish to make changes to these settings, you will need to modify `package.json`, `simple-proxy-api.yaml` and `cloudformation.yaml` manually.
3. Run `npm run setup` (Windows users: `npm run win-setup`) - this installs the node dependencies, creates an S3 bucket (if it does not already exist), packages and deploys your serverless Express application to AWS Lambda, and creates an API Gateway proxy API.
4. After the setup command completes, open the AWS CloudFormation console https://console.aws.amazon.com/cloudformation/home and switch to the region you specified. Select the `AwsServerlessExpressStack` stack, then click the `ApiUrl` value under the __Outputs__ section - this will open a new page with your running API. The API index lists the resources available in the example Express server (`app.js`), along with example `curl` commands.

See the sections below for details on how to migrate an existing (or create a new) Node.js project based on this example. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the `config` command for step 1 and want to delete that bucket, run `npm run delete-bucket`.

### Creating or migrating a Node.js project based on the example

To use this example as a base for a new Node.js project:

1. Copy the files in the `examples/basic-starter` directory into a new project directory (`cp -r ./examples/basic-starter ~/projects/my-new-node-project`). If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (you may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. After making updates to `app.js`, simply run `npm run package-deploy` (Windows users: `npm run win-package-deploy`).

To migrate an existing Node server:

1. Copy the following files from the `example` directory: `api-gateway-event.json`, `cloudformation.yaml`, `lambda.js`, and `simple-proxy-api.yaml`. Additionally, copy the `scripts` and `config` sections of `example/package.json` into your existing `package.json` - this includes many helpful commands to manage your AWS serverless assets and perform _basic_ local simulation of API Gateway and Lambda. If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (be sure to copy over `scripts/configure.js`. You may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. From your existing project directory, run `npm install --save aws-serverless-express`.
3. Modify `lambda.js` to import your own server configuration (eg. change `require('./app')` to `require('./server')`). You will need to ensure you export your app configuration from the necessary file (eg. `module.exports = app`). This library takes your app configuration and listens on a Unix Domain Socket for you, so you can remove your call to `app.listen()` (if you have a `server.listen` callback, you can provide it as the second parameter in the `awsServerlessExpress.createServer` method).
4. Modify the `CodeUri` property of the Lambda function resource in `cloudformation.yaml` to point to your application directory (e.g. `CodeUri: ./src`). If you are using a build tool (e.g. Gulp, Grunt, Webpack, Rollup, etc.), you will instead want to point to your build output directory.
5. Run `npm run package-deploy` (Windows users: `npm run win-package-deploy`) to package and deploy your application.

To perform a basic, local simulation of API Gateway and Lambda with your Node server, update `api-gateway-event.json` with some values that are valid for your server (`httpMethod`, `path`, `body` etc.) and run `npm run local`. AWS Lambda uses NodeJS 4.3 LTS, and it is recommended to use the same version for testing purposes.

If you need to make modifications to your API Gateway API, modify `simple-proxy-api.yaml` and run `npm run package-deploy`. If your API requires CORS, be sure to modify the two `options` methods defined in the Swagger file, otherwise you can safely remove them. To modify your other AWS assets, make your changes to `cloudformation.yaml` and run `npm run package-deploy`. Alternatively, you can manage these assets via the AWS console.

## Node.js version

This example was written against Node.js version 6.10
