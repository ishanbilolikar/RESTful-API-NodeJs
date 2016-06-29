//Get the required packages
var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var app = express();

//API URIs
var apiUri = 'http://gmapi.azurewebsites.net';
var getVehicleInfo = '/getVehicleInfoService';
var getSecurityStatus = '/getSecurityStatusService';
var getEnergyStatus = '/getEnergyService';
var actionEngine = '/actionEngineService';

//Smartcar VEHICLE INFO API
app.get('/vehicles/:id', function (req, res){
	
	var id = req.param('id');
	
	var reqBody = JSON.stringify({"id":id,"responseType": "JSON"});

	//requesting resource from GM API
	request.post({
		headers: {'content-type' : 'application/json'},
		uri: apiUri+getVehicleInfo,
		body: reqBody
	 }, function(error,response,body){
		 
		 var jsonData = JSON.parse(body);
						
		if (!error && jsonData.status == 200) {
            
			var vin = jsonData.data.vin.value;
			var color = jsonData.data.color.value;
			var driveTrain = jsonData.data.driveTrain.value;
			var fourDoorSedan = jsonData.data.fourDoorSedan.value;
			var twoDoorCoupe = jsonData.data.twoDoorCoupe.value;
			
			var doorCount = 0;
			if(fourDoorSedan == 'True'){
				doorCount = 4;				
			}
			else{
				doorCount = 2;
			}
			
			var strRes = JSON.stringify({vin:vin,color:color,doorCount:doorCount,driveTrain:driveTrain});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
        }
		else if(!error && jsonData.status == 404){
			
			var responseMsg = jsonData.reason;
			var strRes = JSON.stringify({id:id,errorMessage:responseMsg});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
		}
		else{
		    res.json("Error calling the GM API "+getVehicleInfo);	
		}
	});
});

//Smartcar SECURITY API
app.get('/vehicles/:id/doors', function (req, res){
	
	var id = req.param('id');
	var resBody = '';
	
	var reqBody = JSON.stringify({"id":id,"responseType": "JSON"});

	//requesting GM Security API for resource
	request.post({
		headers: {'content-type' : 'application/json'},
		uri: apiUri+getSecurityStatus,
		body: reqBody
	 }, function(error,response,body){
		 
		 var jsonData = JSON.parse(body);
						
		if (!error && jsonData.status == 200) {
            
			var arrLength = jsonData.data.doors.values.length;
			var dataObj = [];
			
			for (var i = 0; i < arrLength; i++) {
				var arrValues = jsonData.data.doors.values[i];
				var lock = true;
				if(arrValues.locked.value === 'False'){
					lock = false;
				}
				dataObj.push({location:arrValues.location.value,locked:lock});
			}
			 var strRes = JSON.stringify(dataObj);			
			 var jsonRes = JSON.parse(strRes);
			 res.json(jsonRes);
        }
		else if(!error && jsonData.status == 404){
			
			var responseMsg = jsonData.reason;
			var strRes = JSON.stringify({id:id,errorMessage:responseMsg});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
		}
		else{
		    res.json("Error calling the GM API "+getSecurityStatus);	
		}
	});
});

//Smartcar FUEL RANGE API
app.get('/vehicles/:id/fuel', function (req, res){
	
	var id = req.param('id');
	var resBody = '';
	
	var reqBody = JSON.stringify({"id":id,"responseType": "JSON"});

	//requesting GM API
	request.post({
		headers: {'content-type' : 'application/json'},
		uri: apiUri+getEnergyStatus,
		body: reqBody
	 }, function(error,response,body){
		 
		 var jsonData = JSON.parse(body);
						
		if (!error && jsonData.status == 200) {
            
			var fuelLevel = jsonData.data.tankLevel.value;
			
			var strRes = JSON.stringify({percent:fuelLevel});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
        }
		else if(!error && jsonData.status == 404){
			
			var responseMsg = jsonData.reason;
			var strRes = JSON.stringify({id:id,errorMessage:responseMsg});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
		}
		else{
		    res.json("Error calling the GM API "+actionEngine);	
		}
	});
});

//Smartcar BATTERY RANGE API
app.get('/vehicles/:id/battery', function (req, res){
	
	var id = req.param('id');
	var resBody = '';
	
	var reqBody = JSON.stringify({"id":id,"responseType": "JSON"});
	
	request.post({
		headers: {'content-type' : 'application/json'},
		uri: apiUri+getEnergyStatus,
		body: reqBody
	 }, function(error,response,body){
		 
		 var jsonData = JSON.parse(body);
						
		if (!error && jsonData.status == 200) {
            
			var battLevel = jsonData.data.batteryLevel.value;
			
			var strRes = JSON.stringify({percent:battLevel});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
        }
		else if(!error && jsonData.status == 404){
			
			var responseMsg = jsonData.reason;
			var strRes = JSON.stringify({id:id,errorMessage:responseMsg});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
		}
		else{
		    res.json("Error calling the GM API "+getEnergyStatus);	
		}
	});
});


//using body-parser for POST request
app.use(bodyParser.json());
//Smartcar START/STOP ENGINE API
app.post('/vehicles/:id/engine', function (req, res){
	
	var id = req.param('id');	
	var action = req.body.action;
	
	if(action == 'START'){
		action = 'START_VEHICLE';
	}
	else if(action == 'STOP'){
		action = 'STOP_VEHICLE';
	}
	else{
		action = '';
	}
	
	var reqBody = JSON.stringify({id:id,command:action,responseType: "JSON"});
	
	request.post({
		headers: {'content-type' : 'application/json'},
		uri: apiUri+actionEngine,
		body: reqBody
	 }, function(error,response,body){
		
		var jsonData = JSON.parse(body);
		
		if (!error && jsonData.status == 200) {
        	
			var status = jsonData.actionResult.status;
			
			if(status == 'EXECUTED'){
				status = 'success';
			}
			else if(status == 'FAILED'){
				status = 'error';
			}
			else{
				status = '';
			}
			
			var strRes = JSON.stringify({status:status});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
        }
		else if(!error && jsonData.status == 404){
			var responseMsg = jsonData.reason;
			var strRes = JSON.stringify({id:id,errorMessage:responseMsg});
			var jsonRes = JSON.parse(strRes);
			res.json(jsonRes);
		}
		else{
			res.json("Error calling the GM API "+actionEngine);
		}
	});
});

//Smartcar API Port
app.listen(3000);