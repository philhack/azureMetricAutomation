import dotenv from 'dotenv';
import _ from 'lodash';
const Client = require('node-rest-client').Client;
let client = new Client();
import 'babel-polyfill';
import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import AzureMetricApiClient from './azureMetricApiClient';
import type { Subscription, AuthToken, AppServicePlanProperties, AppServicePlan, Sku, MemoryPercentageResult} from './azureMetricClasses';
let azureMetricApiClient = new AzureMetricApiClient(request, process.env);
// let azureMetricLogger = new AzureMetricLogger(console);
import express from 'express';
const app = express();

dotenv.load();

app.get('/', async function (req, res) {

    let authToken = await azureMetricApiClient.getAuthToken();

    let subscriptions = await azureMetricApiClient.getAllSubscriptions(authToken.access_token);

    for(let subscription: Subscription of subscriptions.value){
        console.log('---------------------------------------------------');
        console.log(`${subscription.id} | ${subscription.displayName}`);
        const appServicePlans = await azureMetricApiClient.getAllAppServicePlansBySubscription(authToken.access_token, subscription.id);
        //console.log(appServicePlans.value);


        for(let appServicePlan: AppServicePlan of appServicePlans.value){
            console.log('---------------------------------------------------');
            console.log(`${appServicePlan.name}`);
            const appServicePlanMemoryUsage  = await azureMetricApiClient.getMemoryUsageForAppServicePlan(authToken.access_token, appServicePlan.id);
            if(appServicePlanMemoryUsage){
                // todo: write a function that will take the max and avaerage for all of the values returned in the array
                console.log(`${appServicePlanMemoryUsage.value[0].name.value}: ${appServicePlanMemoryUsage.value[0].data[0].average}`);
            }
        }

    }

    res.send('Azure Metrics');
});

app.listen(process.env.PORT, function () {
    console.log(`App listening on ${process.env.PORT}`);
});



