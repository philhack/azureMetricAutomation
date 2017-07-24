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

    let authToken = process.env.AUTH_TOKEN;
    console.log('-------------------');
    console.log(authToken);
    console.log('-------------------');

    let allSubscriptions = await azureMetricApiClient.getAllSubscriptions(authToken);
    console.log(allSubscriptions);

    res.send('Azure Metrics');
});

app.listen(process.env.PORT, function () {
    console.log(`App listening on ${process.env.PORT}`);
});



