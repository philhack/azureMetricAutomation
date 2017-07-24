// @flow
import {Subscription} from "./azureMetricClasses";
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
            uri: `${this.environment.AZURE_MANAGEMENT_URL}/subscriptions?api-version=2016-06-01`,
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
}