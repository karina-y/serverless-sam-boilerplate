'use strict'
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const app = express();
const router = express.Router();
const AWS = require('aws-sdk');
const dynamodbClient = new AWS.DynamoDB.DocumentClient({region: 'YOUR_AWS_REGION'});
const uuidv4 = require('uuid/v4');
const check = require('check-types');

app.set('view engine', 'pug')

if (process.env.NODE_ENV === 'test') {
  // NOTE: aws-serverless-express uses this app for its integration tests
  // and only applies compression to the /sam endpoint during testing.
  router.use('/sam', compression())
} else {
  router.use(compression())
}

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(awsServerlessExpressMiddleware.eventContext())



//GET
router.get('/YOUR_ENDPOINT_HERE/:id', async (req, res) => {
  //create new data object to prevent injection of invalid data
  const data = req.params.id;

  //check datatypes
  if (check.nonEmptyString(data)) {
	const response = await getData(data);
	res.json(response);
  } else {
	console.log("*****ERR 422");
	return;
  }

});

const getData = async(body) => {

  const params = {
	TableName: 'YOUR_TABLE_NAME',
	Key: {
	  id: body
	}
  }

  try{
	const data = await dynamodbClient.get(params).promise();
	return data;
  } catch(error) {
	return error;
  }
}



//INSERT
router.post('/YOUR_ENDPOINT_HERE', async (req, res) => {
  //create new data object to prevent injection of invalid data
  let data = ((
		  {
			REPLACE_DATA_FIELD_HERE,
			REPLACE_DATA_FIELD_2_HERE
		  }
  ) => (
		  {
			REPLACE_DATA_FIELD_HERE,
			REPLACE_DATA_FIELD_2_HERE
		  }
  ))(req.body);

  //check datatypes
  if (check.nonEmptyString(data.REPLACE_DATA_FIELD_HERE) &&
		  check.array.of.nonEmptyString(data.REPLACE_DATA_FIELD_2_HERE)) {

	const response = await insertData(data);
	res.json(response);

  } else {
	console.log("*****ERR 422");
	return;
  }
});

const insertData = async(body) => {

  const params = {
	TableName: 'YOUR_TABLE_NAME',
	Item: {
	  id: uuidv4().toString(),
	  createdAt: Date.now(),
	  REPLACE_DATA_FIELD_HERE: body.REPLACE_DATA_FIELD_HERE
	}
  }

  try{
	let data = await dynamodbClient.put(params).promise();
	return data;
  } catch(error) {
	return error;
  }

}



//UPDATE
router.put('/YOUR_ENDPOINT_HERE', async (req, res) => {
  //create new data object to prevent injection of invalid data
  let data = ((
		  {
			REPLACE_DATA_FIELD_HERE,
			REPLACE_DATA_FIELD_2_HERE
		  }
  ) => (
		  {
			REPLACE_DATA_FIELD_HERE,
			REPLACE_DATA_FIELD_2_HERE
		  }
  ))(req.body);

  //check datatypes
  if (check.nonEmptyString(data.REPLACE_DATA_FIELD_HERE) &&
		  check.array.of.nonEmptyString(data.REPLACE_DATA_FIELD_2_HERE)) {

	const response = await updateData(data);
	res.json(response);

  } else {
	console.log("*****ERR 422");
	return;
  }
});

const updateData = async(body) => {

  const params = {
	TableName: 'YOUR_TABLE_NAME',
	// 'Key' defines the partition key and sort key of the item to be updated
	Key: {
	  id: body.id
	},
	// 'UpdateExpression' defines the attributes to be updated
	// 'ExpressionAttributeValues' defines the value in the update expression
	UpdateExpression: "SET fname = :fname, lname = :lname, phone = :phone, occupation = :occupation, referredFrom = :referredFrom, whatToGain = :whatToGain, outcomes = :outcomes, obstacles = :obstacles, ableToCommit = :ableToCommit, commitmentToResults = :commitmentToResults, availability = :availability, updatedAt = :updatedAt",
	ExpressionAttributeValues: {
	  ":REPLACE_DATA_FIELD_HERE": body.REPLACE_DATA_FIELD_HERE || null,
	  ":REPLACE_DATA_FIELD_2_HERE": body.REPLACE_DATA_FIELD_2_HERE || null,
	  ":updatedAt": Date.now() || null
	},
	// 'ReturnValues' specifies if and how to return the item's attributes,
	// where ALL_NEW returns all attributes of the item after the update; you
	// can inspect 'result' below to see how it works with different settings
	ReturnValues: "ALL_NEW",
  }

  try{
	let data = await dynamodbClient.update(params).promise();
	return data;
  } catch(error) {
	return error;
  }

}



//#region SAM DEFAULTS
// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

router.get('/', (req, res) => {
  res.render('index', {
	apiUrl: req.apiGateway ? `https://${req.apiGateway.event.headers.Host}/${req.apiGateway.event.requestContext.stage}` : 'http://localhost:3000'
  })
})

router.get('/sam', (req, res) => {
  res.sendFile(`${__dirname}/sam-logo.png`)
})

router.get('/users', (req, res) => {
  res.json(users)
})

router.get('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  return res.json(user)
})

router.post('/users', (req, res) => {
  const user = {
	id: ++userIdCounter,
	name: req.body.name
  }
  users.push(user)
  res.status(201).json(user)
})

router.put('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  user.name = req.body.name
  res.json(user)
})

router.delete('/users/:userId', (req, res) => {
  const userIndex = getUserIndex(req.params.userId)

  if (userIndex === -1) return res.status(404).json({})

  users.splice(userIndex, 1)
  res.json(users)
})

const getUser = (userId) => users.find(u => u.id === parseInt(userId))
const getUserIndex = (userId) => users.findIndex(u => u.id === parseInt(userId))

// Ephemeral in-memory data store
const users = [{
  id: 1,
  name: 'Joe'
}, {
  id: 2,
  name: 'Jane'
}]

let userIdCounter = users.length
//#endregion


// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
