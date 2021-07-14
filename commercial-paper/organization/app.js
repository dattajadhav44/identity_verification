
var express = require('express');
var app = express();
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/dev');
var validator = require('express-validator');
var digiInvoke = require('./digibank/application/invoke');
var digiUser = require('./digibank/application/enrollUser');
var digiQuery = require('./digibank/application/query')
var magnInvoke = require('./magnetocorp/application/invoke');
var magnUser = require('./magnetocorp/application/enrollUser');
var magnQuery = require('./magnetocorp/application/query')

var cors = require('cors');

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(validator());
app.use(bodyParser.urlencoded({extended: false}));


// mongoose.connect(config.MONGODB_URI, {useNewUrlParser : true}).then(()=> {
// 	console.log('DB connection successful');
// }).catch((err) => {
// 	console.error(err);
// });

// mongoose.connect("mongodb://localhost/elm_db", { useCreateIndex: true, useNewUrlParser: true });
// mongoose.Promise = global.Promise;

app.get('/', function (req, res) {
    res.send("-----------------------Welcome to Identity verification application----------------------------")
})

// Register and enroll users on Blockchain
app.post('/api/v1/users/registration', async function (req, res) {
console.log("req", req.body);    
    var userName = req.body.userName;
    var orgName = req.body.orgName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + userName);
    logger.debug('Org name  : ' + orgName);
    if (!userName) {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }
    if (!orgName) {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }
    
    let result;
    if (req.body.orgName == 'Org1') {
       result = await digiUser.registerUser(req.body);
    } else if (req.body.orgName == 'Org2') {
       result = await magnUser.registerUser(req.body);
    } else {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
     }
    console.log("Result:", result)
    res.send(result)
    console.log("-----------user registration done--------------", result)

});

// Invoke transaction on chaincode on target peers
app.post('/api/v1/identity/createNationalId', async function (req, res) {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');
    var fcn = req.body.fcn;
    logger.debug('fcn  : ' + fcn);
    if (!fcn || !req.body.national_identity || !req.body.orgName || !req.body.userName || !req.body.name_of_person) {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }
    
    if (!req.body.alternate_name) {
        req.body.alternate_name = req.body.name_of_person
    }

    if (!req.body.date_of_birth || !req.body.place_of_birth || !req.body.place_of_issue) {
        req.body.date_of_birth = "20/20/2099"
        req.body.place_of_birth = "Dummy City Place"
        req.body.place_of_issue = "Dummy Issue Place"
    }

    let message;
    if (req.body.orgName == 'Org1') {
        message = await digiInvoke.invokeSmartContract(req.body);
    } else if (req.body.orgName == 'Org2') {
        message = await magnInvoke.invokeSmartContract(req.body);   
    } else {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }
    res.send(message);
});

// Query on chaincode on target peers
app.get('/api/v1/identity/getNationalId', async function (req, res) {
    logger.debug('==================== QUERY BY CHAINCODE ==================');
   
    let fcn = req.body.fcn;
    console.log("request body", req.body);   
   
    if (!fcn || !req.body.national_identity || !req.body.orgName || !req.body.userName ) {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }
    
    let message;
    if (req.body.orgName == 'Org1') {
       message = await digiQuery.querySmartContract(req.body);
    } else if(req.body.orgName == 'Org2') {
       message = await magnQuery.querySmartContract(req.body);
    } else {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }   
    res.send(message);
});

app.post('/api/v1/identity/verify/nationalId', async function (req, res) {
    logger.debug('==================== QUERY BY CHAINCODE ==================');
   
    let fcn = req.body.fcn;
    console.log("request body", req.body);   
   
    if (!fcn || !req.body.national_identity || !req.body.orgName || !req.body.userName ) {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }

    let message;
    if (req.body.orgName == 'Org1') {
       message = await digiQuery.querySmartContract(req.body);
    } else if(req.body.orgName == 'Org2') {
       message = await magnQuery.querySmartContract(req.body);
    } else {
       error_msg = {"Status": 400, "Message": "Invalid request param, kindly resubmit the request"};
       res.send(error_msg);
    }   
    res.send(message);
});

app.listen(7913, () => console.log('The app is listening on port 7913!'))
