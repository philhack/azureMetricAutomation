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
                let average = _.maxBy(appServicePlanMemoryUsage.value[0].data, (d) => {
                   return d.average;
                });

                let maximum = _.maxBy(appServicePlanMemoryUsage.value[0].data, (d) => {
                    return d.maximum;
                });
                console.log(`${appServicePlanMemoryUsage.value[0].name.value}| avg: ${_.round(average.average, 1)} | max: ${_.round(maximum.maximum, 1)}`);
            }
        }

    }

    res.send('Azure Metrics');
});

app.listen(process.env.PORT, function () {
    console.log(`App listening on ${process.env.PORT}`);
});



