import dotenv from 'dotenv';
import _ from 'lodash';
const Client = require('node-rest-client').Client;
let client = new Client();
import 'babel-polyfill';
import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import AzureMetricApiClient from './azureMetricApiClient';
import type { Subscription, AuthToken, AppServicePlanProperties, AppServicePlan, Sku} from './azureMetricClasses';
let azureMetricApiClient = new AzureMetricApiClient(request, process.env);
// let azureMetricLogger = new AzureMetricLogger(console);
import express from 'express';
const app = express();

dotenv.load();

app.get('/', async function (req, res) {

    let authToken = await azureMetricApiClient.getAuthToken();

    let subscriptions = await azureMetricApiClient.getAllSubscriptions(authToken.access_token);

    for(let subscription of subscriptions.value){
        console.log('---------------------------------------------------');
        console.log(`${subscription.id} | ${subscription.displayName}`);
        const appServicePlans = await azureMetricApiClient.getAllAppServicePlansBySubscription(authToken.access_token, subscription.id);
        console.log(appServicePlans.value);
        console.log('---------------------------------------------------');
    }

    res.send('Azure Metrics');
});

app.listen(process.env.PORT, function () {
    console.log(`App listening on ${process.env.PORT}`);
});



