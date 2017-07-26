import dotenv from 'dotenv';
import _ from 'lodash';
const Client = require('node-rest-client').Client;
let client = new Client();
import 'babel-polyfill';
import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import AzureMetricApiClient from './azureMetricApiClient';
import type { Subscription, AuthToken, AppServicePlanProperties, AppServicePlan, Sku, MemoryPercentageResult, CpuPercentageResult} from './azureMetricClasses';
let azureMetricApiClient = new AzureMetricApiClient(request, process.env);
// let azureMetricLogger = new AzureMetricLogger(console);
import express from 'express';
const app = express();

dotenv.load();

app.get('/', async function (req, res) {

    let authToken = await azureMetricApiClient.getAuthToken();
    var overall = [];

    let subscriptions = await azureMetricApiClient.getAllSubscriptions(authToken.access_token);

    for(let subscription: Subscription of subscriptions.value){
        console.log('---------------------------------------------------');
        console.log(`Subscription: ${subscription.displayName}`);
        overall.push({
            subscription: {
                id: subscription.id,
                name: subscription.displayName
            },
            appServicePlans: []
        });

        const appServicePlans = await azureMetricApiClient.getAllAppServicePlansBySubscription(authToken.access_token, subscription.id);
        //console.log(appServicePlans.value);


        for(let appServicePlan: AppServicePlan of appServicePlans.value){
            console.log(`App Service Plan: ${appServicePlan.name}`);

            let subscriptionIndex = _.findIndex(overall, (o) => {
               return o.subscription.id == subscription.id;
            });

            let webAppDetails = {
                id: appServicePlan.id,
                name: appServicePlan.name,
                location: appServicePlan.location,
                sku: appServicePlan.sku.name,
                webApps: []
            };

            const appServicePlanMemoryUsage  = await azureMetricApiClient.getMemoryUsageForAppServicePlan(authToken.access_token, appServicePlan.id);
            webAppDetails = appendMemoryUsageForAppServicePlan(appServicePlanMemoryUsage, authToken.access_token, appServicePlan.id, webAppDetails);

            const appServicePlanCpuUsage  = await azureMetricApiClient.getCpuUsageForAppServicePlan(authToken.access_token, appServicePlan.id);
            webAppDetails = appendCpuUsageForAppServicePlan(appServicePlanCpuUsage, authToken.access_token, appServicePlan.id, webAppDetails);

            overall[subscriptionIndex].appServicePlans.push(webAppDetails);
        }
        console.log('---------------------------------------------------');
    }

    function appendMemoryUsageForAppServicePlan(appServicePlanMemoryUsage, accessToken, appServicePlanId, webAppDetails){
        if(appServicePlanMemoryUsage){
            let averageMemory = _.maxBy(appServicePlanMemoryUsage.value[0].data, (d) => {
                return d.average;
            });

            let maximumMemory = _.maxBy(appServicePlanMemoryUsage.value[0].data, (d) => {
                return d.maximum;
            });
            console.log(` * ${appServicePlanMemoryUsage.value[0].name.value}| avg: ${_.round(averageMemory.average, 1)}% | max: ${_.round(maximumMemory.maximum, 1)}%`);

            webAppDetails.averageMemory = `${_.round(averageMemory.average, 1)}%`;
            webAppDetails.maximumMemory = `${_.round(maximumMemory.maximum, 1)}%`;
        }
        return webAppDetails;
    }

    function appendCpuUsageForAppServicePlan(appServicePlanCpuUsage, accessToken, appServicePlanId, webAppDetails){
        if(appServicePlanCpuUsage){
            let averageCpu = _.maxBy(appServicePlanCpuUsage.value[0].data, (d) => {
                return d.average;
            });

            let maximumCpu = _.maxBy(appServicePlanCpuUsage.value[0].data, (d) => {
                return d.maximum;
            });
            console.log(` * ${appServicePlanCpuUsage.value[0].name.value}| avg: ${_.round(averageCpu.average, 1)}% | max: ${_.round(maximumCpu.maximum, 1)}%`);

            webAppDetails.averageCpu = `${_.round(averageCpu.average, 1)}%`;
            webAppDetails.maximumCpu = `${_.round(averageCpu.maximum, 1)}%`;
        }
        return webAppDetails;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(overall));
});

app.listen(process.env.PORT, function () {
    console.log(`App listening on ${process.env.PORT}`);
});



