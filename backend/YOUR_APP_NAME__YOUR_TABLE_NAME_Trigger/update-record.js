const AWS = require('aws-sdk');
const dynamodbClient = new AWS.DynamoDB.DocumentClient({ region: 'YOUR_AWS_REGION' });


exports.updateRecord = async(body) => {

  const params = {
	TableName: 'YOUR_TABLE_NAME',
	// 'Key' defines the partition key and sort key of the item to be updated
	Key: {
	  id: body
	},
	// 'UpdateExpression' defines the attributes to be updated
	// 'ExpressionAttributeValues' defines the value in the update expression
	UpdateExpression: "SET emailSent = :emailSent, updatedAt = :updatedAt",
	ExpressionAttributeValues: {
	  ":emailSent": true,
	  ":updatedAt": Date.now(),
	},
	// 'ReturnValues' specifies if and how to return the item's attributes,
	// where ALL_NEW returns all attributes of the item after the update; you
	// can inspect 'result' below to see how it works with different settings
	ReturnValues: "ALL_NEW",
  }

  try {
	let data = await dynamodbClient.update(params).promise();
	console.log("*******updateRecord SUCCESS");
	return data;
  }
  catch (error) {
	console.log("*******updateRecord ERR", error);
	return error;
  }

}
