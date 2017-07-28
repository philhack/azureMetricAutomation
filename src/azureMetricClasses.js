// @flow
'use strict';

export class Subscription{
    id: string;
    subscriptionId: string;
    displayName: string;
    state: string;
}

export class AuthToken{
    access_token: string;
}

export class Sku {
    name: string;
    tier: string;
    size: string;
    family: string;
    capacity: number;
}

export class AppServicePlanProperties{
    numberOfSites: number;
}

export class AppServicePlan{
    id: string;
    name: string;
    location: string;
    properties: AppServicePlanProperties;
    sku: Sku;
}

export class AppServicePlanMetric{
    timeStamp: Date;
    average: number;
    maximum: number
}

export class MetricName{
    value: string;
    localizedValue: string;
}

export class MemoryPercentageResult{
    value: [{
            data: Array<AppServicePlanMetric>;
            name: MetricName;
            id: string
        }
    ]
}
export class CpuPercentageResult{
    value: [{
            data: Array<AppServicePlanMetric>;
            name: MetricName;
            id: string
        }
    ]
}

export class WebApp{
    id: string;
    name: string;
}
