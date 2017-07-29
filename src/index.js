import dotenv from 'dotenv';
import _ from 'lodash';
const Client = require('node-rest-client').Client;
let client = new Client();
import 'babel-polyfill';
import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import AzureMetricApiClient from './azureMetricApiClient';
import type { Subscription, AuthToken, AppServicePlanProperties, AppServicePlan, Sku, MemoryPercentageResult, CpuPercentageResult, WebApp} from './azureMetricClasses';
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

        for(let appServicePlan: AppServicePlan of appServicePlans.value){
            console.log(`App Service Plan: ${appServicePlan.name}`);

            let subscriptionIndex = _.findIndex(overall, (o) => {
               return o.subscription.id == subscription.id;
            });

            let appServicePlanDetails = {
                id: appServicePlan.id,
                name: appServicePlan.name,
                location: appServicePlan.location,
                sku: appServicePlan.sku.name,
                webApps: []
            };

            const appServicePlanMemoryUsage  = await azureMetricApiClient.getMemoryUsageForAppServicePlan(authToken.access_token, appServicePlan.id);
            appServicePlanDetails = appendMemoryUsageForAppServicePlan(appServicePlanMemoryUsage, authToken.access_token, appServicePlan.id, appServicePlanDetails);

            const appServicePlanCpuUsage  = await azureMetricApiClient.getCpuUsageForAppServicePlan(authToken.access_token, appServicePlan.id);
            appServicePlanDetails = appendCpuUsageForAppServicePlan(appServicePlanCpuUsage, authToken.access_token, appServicePlan.id, appServicePlanDetails);


            let webApps = await azureMetricApiClient.getAllAppWebApps(authToken.access_token, subscription.id, appServicePlan.properties.resourceGroup);
            webApps = _.filter(webApps.value, function (item) {
                return item.properties.serverFarmId === appServicePlanDetails.id;
            });

            for(let webApp: WebApp of webApps){

                console.log(`Getting stats for web app: ${webApp.name}`);

                const webAppMemoryWorkingSet  = await azureMetricApiClient.getMemoryWorkingSetForWebApp(authToken.access_token, subscription.id, webApp.properties.resourceGroup, webApp.name);

                if(webAppMemoryWorkingSet){
                    let averageMemoryInBytes = _.maxBy(webAppMemoryWorkingSet.value[0].data, (d) => {
                        return d.average;
                    });

                    let maximumMemoryInBytes = _.maxBy(webAppMemoryWorkingSet.value[0].data, (d) => {
                        return d.maximum;
                    });
                    console.log(` * ${webAppMemoryWorkingSet.value[0].name.value}| avg: ${_.round(averageMemoryInBytes.average, 1)} bytes | max: ${_.round(maximumMemoryInBytes.maximum, 1)} bytes`);

                    appServicePlanDetails.webApps.push({
                        id: webApp.id,
                        name: webApp.name,
                        averageMemoryInMb: _.round(((averageMemoryInBytes.average / 1024) / 1024),0),
                        maximumMemoryInMb: _.round(((maximumMemoryInBytes.maximum / 1024) / 1024),0)
                    });
                } else {
                    appServicePlanDetails.webApps.push({
                        id: webApp.id,
                        name: webApp.name,
                        averageMemoryInMb: 0,
                        maximumMemoryInMb: 0,
                    });
                }
            }

            overall[subscriptionIndex].appServicePlans.push(appServicePlanDetails);
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



