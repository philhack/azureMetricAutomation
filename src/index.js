import dotenv from 'dotenv';
import _ from 'lodash';
const Client = require('node-rest-client').Client;
let client = new Client();
import 'babel-polyfill';
import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import AzureMetricApiClient from './azureMetricApiClient';
import type { Subscription} from './azureMetricClasses';
let azureMetricApiClient = new AzureMetricApiClient(request, process.env);
// let azureMetricLogger = new AzureMetricLogger(console);
import express from 'express';
const app = express();

dotenv.load();

app.get('/', async function (req, res) {

    // let authToken = process.env.AUTH_TOKEN;
    console.log('getting auth token');
    let authToken = await azureMetricApiClient.getAuthToken();
    console.log(authToken);

    let subscriptions = await azureMetricApiClient.getAllSubscriptions(authToken.access_token);

    subscriptions.value.forEach((subscription : Subscription) => {
        console.log();
        console.log(`${subscription.id} | ${subscription.displayName}`);
    });

    res.send('Azure Metrics');
});

app.listen(process.env.PORT, function () {
    console.log(`App listening on ${process.env.PORT}`);
});



