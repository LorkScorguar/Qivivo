// Qivivo
// Written by lorkscorguar@gmail.com

const https = require('https');
const http = require('http');
const parsedJSON = require('./Config.json');
const querystring = require('querystring');
const fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";//to avoid certificate problem

var client_id=parsedJSON['client_id'];
var secret_id=parsedJSON['secret_id'];
var token=parsedJSON['token'];
var refresh_token=parsedJSON['refresh_token'];
var redirect_uri=parsedJSON['redirect_uri'];
var thermostat_id=parsedJSON['thermostat_id'];

function updateConf(newToken,newRefreshToken){
  var config = {};
  config['client_id']=client_id;
  config['secret_id']=secret_id;
  config['token']=newToken;
  config['refresh_token']=newRefreshToken;
  config['redirect_uri']=redirect_uri;
  config['thermostat_id']=thermostat_id;
  config['proxy']=proxy;
  var json=JSON.stringify(config);
  fs.writeFile('Config.json',json, 'utf8');
}

function refreshToken(callback){
  data=querystring.stringify({
    'client_id': client_id,
    'grant_type': 'refresh_token',
    'client_secret': secret_id,
    'redirect_uri': redirect_uri,
    'refresh_token': refresh_token,
  });
  var req = https.request({
    host: 'account.qivivo.com',
    path: "/oauth/token?grant_type=refresh_token&client_id="+client_id+"&client_secret="+secret_id+"&redirect_uri="+redirect_uri+"&refresh_token="+refresh_token,
    agent: false,    // cannot use a default agent
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(data),
      'authorization': 'Bearer '+token,
    }
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', (data) => {
      jResp = JSON.parse(data);
    });
    res.on('end', (data) => {
      callback(jResp['access_token'],jResp['refresh_token']);
    });
    req.write(data);
  }).end();
}

function getTemp(callback){
  var req = https.get({
    host: 'data.qivivo.com',
    path: '/api/v2/devices/thermostats/'+thermostat_id+'/temperature',
    agent: false,    // cannot use a default agent
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer '+token,
    }
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', (data) => {
      jResp = JSON.parse(data);
    });
    res.on('end', (data) => {
      callback(jResp['temperature']);
    });
  }).end();
}


exports.qivivo = function qivivo (req, res) {
  getTemp(function(result){
    if (typeof result == "undefined") {
      refreshToken(function(newToken,newRefreshToken){
        updateConf(newToken,newRefreshToken)
        token=newToken
        getTemp(function(result){
          res.send("La température est de "+result);
        });
      });
    }
    else{
      res.send("La température est de "+result);
    }
  });
};
