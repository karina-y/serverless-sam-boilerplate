const AWS = require('aws-sdk');
const ses = new AWS.SES();
const update = require('update-record.js');


exports.handler = function index(event, context, callback) {
  const result = buildData(event);
  callback(null, result);

}

const sendEmail = function(emailContent) {
  //send email first
  let templateData = JSON.stringify({
	"REPLACE_DATA_T0_SEND": emailContent.REPLACE_DATA_T0_SEND,
	"email": emailContent.email
  });

  let params = {
	"Source": process.env.FROM_EMAIL,
	"Template": "REPLACE_EMAIL_TEMPLATE_NAME_HERE",
	"Destination": {
	  "ToAddresses": [emailContent.email]
	},
	"TemplateData": templateData
  }

  ses.sendTemplatedEmail(params, (err, data) => {
	if (err) {
	  console.log("******sendTemplatedEmail ERR", err, err.stack);
	}
	else {
	  console.log("******sendTemplatedEmail SUCCESS");

	  //on success, update the db
	  return update.updateRecord(emailContent.id);

	}
  });

}

const buildData = function(event) {

  //checking this so lambda doesn't keep retrying if any of these are undefined
  if (event && event.Records.length > 0 && event.Records[0].dynamodb && event.Records[0].dynamodb.NewImage) {
	const records = event.Records;
	const insertEvents = records.filter(x => x.eventName === "INSERT" && (x.dynamodb.NewImage.contacted == null || x.dynamodb.NewImage.contacted.BOOL === false));

	//should only ever be getting one
	const record = insertEvents[0];

	//checking this so lambda doesn't keep retrying if any of these are undefined
	if (record && record.dynamodb && record.dynamodb.NewImage) {
	  const emailData = {
		id: record.dynamodb.NewImage.id.S,
		REPLACE_DATA_T0_SEND: record.dynamodb.NewImage.REPLACE_DATA_T0_SEND.S,
		email: record.dynamodb.NewImage.email.S
	  }

	  return sendEmail(emailData);
	}
  }
  else {
	return;
  }

}
