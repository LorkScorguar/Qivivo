"use strict";

// use the firebase lib
const functions = require('firebase-functions');
const dependencies = require('./dependencies');
const qivivo = require('./qivivo');

// use the actions sdk part of the actions on google lib
var ActionsSdk = require('actions-on-google').ActionsSdkApp;

/**
 * This function is exposed via Firebase Cloud Functions.
 * It determines the next busses leaving from the
 * closest busstop to our home.
 *
 * You normally create one function for all intents. If you
 * want to use more functions, you have to configure all
 * those fullfillment endpoints.
 *
 * Note: Your fulfillment must respond within five seconds.
 * For details see the blue box at the top of this page:
 * https://developers.google.com/actions/apiai/deploy-fulfillment
 */
exports.qivivo = functions.https.onRequest((request, response) => {

    // create an ActionsSdkApp object;
    // indirection is used instead of constructor to
    // be ease testing the functions
    var app = dependencies.createAppObject(request, response);

    function handleMainIntent() {
      app.ask("Que voulez-vous savoir?");
    }

    function handleTextIntent() {
      var regexGetTemp = new RegExp("^(Q|q)uel.*temp[eéè]rature.*$");
      var regexGetHum = new RegExp("^(Q|q)uel.*humidit[eéè].*$");
      var regexGetProg = new RegExp("^(Q|q)uel.*programme.*$");
      const input = app.getRawInput();
      if (regexGetTemp.test(input)) {
        qivivo.getInfo("getTemp",function(result){
          app.tell("La température est de "+result+" degrés.");
        });
      }
      else if (regexGetHum.test(input)) {
        qivivo.getInfo("getHum",function(result){
          app.tell("Le taux d'humidité est de "+result+" pour cent.");
        });
      }
      else if (regexGetProg.test(input)) {
        qivivo.getInfo("getProg",function(result){
          try {
            app.tell("Le programme actuel est "+result+".");
          } catch (err) {
            app.tell("Une erreur est survenue.");
          }
        });
      }
      else {
        app.tell("Je n'ai pas compris.");
      }
    }

    // finally: create map and handle request
    // map all intents to specific functions
    let actionMap = new Map();
    actionMap.set(app.StandardIntents.MAIN, handleMainIntent);
    // anything follow-up requests will trigger the next intent.
    // Be sure to include it.
    actionMap.set(app.StandardIntents.TEXT, handleTextIntent);

    // apply this map and let the sdk parse and handle the request
    // and your responses
    app.handleRequest(actionMap);
});
