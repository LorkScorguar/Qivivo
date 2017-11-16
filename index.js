"use strict";

// use the firebase lib
const functions = require('firebase-functions');
const dependencies = require('./dependencies');

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
      re = new RegExp("^quel.*temp[eéè]rature.*$");
      if (re.test(app.getRawInput())) {
        app.tell("Il fait 19 degrés dans le salon.");
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
