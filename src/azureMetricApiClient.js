// @flow
import {Subscription, AuthToken, AppServicePlan, AppServicePlanProperties, Sku} from './azureMetricClasses';
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
                'detailed': 'true'
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