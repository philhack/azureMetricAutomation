// @flow
import {Subscription, AuthToken, AppServicePlan, AppServicePlanProperties, Sku, MemoryPercentageResult, CpuPercentageResult, WebApp, MemoryWorkingSeteResult} from './azureMetricClasses';
import querystring from 'querystring';
'use strict';

export default class AzureMetricApiClient {
    request: any;
    environment: any;

    constructor(request: any, environment: any) {
        this.request = request;
        this.environment = environment;
    }

    async getAllSubscriptions(authToken: string): Promise<Array<Subscription>> {
        let options = {
            uri: `${this.environment.AZURE_MANAGEMENT_URL}/subscriptions`,
            qs: {
                'api-version': '2016-06-01'
            },
            auth: {
                'bearer': authToken
            },
            json: true
        };

        return await this.request(options);
    };

    async getAllAppServicePlansBySubscription(authToken: string, subscriptionId: string): Promise<Array<AppServicePlan>> {
        let options = {
            uri: `${this.environment.AZURE_MANAGEMENT_URL}/${subscriptionId}/providers/Microsoft.Web/serverfarms`,
            qs: {
                'api-version': '2016-09-01',
                'details': 'true'
            },
            auth: {
                'bearer': authToken
            },
            json: true
        };
        return await this.request(options);
    };

    async getMemoryUsageForAppServicePlan(authToken: string, appServicePlanId: string): Promise<MemoryPercentageResult> {
        let url = `${this.environment.AZURE_MANAGEMENT_URL}${appServicePlanId}/providers/microsoft.insights/metrics`;

        let options = {
            uri: url,
            qs: {
                'api-version': '2016-06-01',
                'details': 'true',
                '$filter': "(name.value eq 'MemoryPercentage') and (aggregationType eq 'Maximum' or aggregationType eq 'Average') and startTime eq 2017-07-01 and endTime eq 2017-07-15 and timeGrain eq duration'PT1H'"
            },
            auth: {
                'bearer': authToken
            },
            json: true
        };

        try {
            return await this.request(options);
        } catch(error){
            console.log(error.message);
            return undefined;
        }
    };

    async getCpuUsageForAppServicePlan(authToken: string, appServicePlanId: string): Promise<CpuPercentageResult> {
        let url = `${this.environment.AZURE_MANAGEMENT_URL}${appServicePlanId}/providers/microsoft.insights/metrics`;

        let options = {
            uri: url,
            qs: {
                'api-version': '2016-06-01',
                'details': 'true',
                '$filter': "(name.value eq 'CpuPercentage') and (aggregationType eq 'Maximum' or aggregationType eq 'Average') and startTime eq 2017-07-01 and endTime eq 2017-07-15 and timeGrain eq duration'PT1H'"
            },
            auth: {
                'bearer': authToken
            },
            json: true
        };

        try {
            return await this.request(options);
        } catch(error){
            console.log(error.message);
            return undefined;
        }
    };


    async getMemoryWorkingSetForWebApp(authToken: string, subscriptionId: string, resourceGroupName: string, webAppName: string): Promise<MemoryWorkingSeteResult> {
        let uri = `${this.environment.AZURE_MANAGEMENT_URL}${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Web/sites/${webAppName}/providers/microsoft.insights/metrics`;
        let options = {
            uri: uri,
            qs: {
                'api-version': '2016-06-01',
                'details': 'true',
                '$filter': "(name.value eq 'MemoryWorkingSet') and (aggregationType eq 'Maximum' or aggregationType eq 'Average') and startTime eq 2017-07-01 and endTime eq 2017-07-15 and timeGrain eq duration'PT1H'"
            },
            auth: {
                'bearer': authToken
            },
            json: true
        };

        try {
            return await this.request(options);
        } catch(error){
            console.log(error.message);
            return undefined;
        }
    };


    async getAllAppWebApps(authToken: string, subscriptionId: string, resourceGroupName: string ): Promise<Array<WebApp>> {
        let uri = `${this.environment.AZURE_MANAGEMENT_URL}${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Web/sites`;

        let options = {
            uri: uri,
            qs: {
                'api-version': '2016-08-01'
            },
            auth: {
                'bearer': authToken
            },
            json: true
        };
        return await this.request(options);
    };

    async getAuthToken(): Promise<AuthToken> {
        let form = {
            grant_type: 'client_credentials',
            resource: 'https://management.core.windows.net/',
            client_id: this.environment.AZURE_CLIENT_ID,
            client_secret: this.environment.AZURE_CLIENT_SECRET
        };

        let formData = querystring.stringify(form);
        let contentLength = formData.length;


        let options = {
            uri: `${this.environment.AZURE_LOGIN_URL}/${this.environment.AZURE_TENANT_ID}/oauth2/token`,
            qs: {
                'api-version': '1.0'
            },
            headers: {
                'Content-Length': contentLength,
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true,
            method: 'POST',
            body: formData


        };

        return await this.request(options);
    };
}