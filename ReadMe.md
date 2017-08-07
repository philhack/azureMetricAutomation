# Azure Metric Automation
This is some pretty simple code written in Node, Express, ES6, ES7 that calls [Azure's REST API](https://docs.microsoft.com/en-us/rest/api/), gets all of the services that the designated account has access to, fetches all of the App Service Plans, fetches all of the Web Apps in the app service plans.

It then displays the CPU and Memory consumption for each App Service Plan, Web App. This allows you to get a handle on optimising the App Service Plan's to ensure they are being fully utilised and avoid burning cash.

## How to Run the App
* [Create a Service Principal](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal) in Azure, granting the service principal account Read access to all of the subscriptions that you want to target. From this, you will need the:
```
* Azure Tenant Id
* Azure Client Id
* Azure Client Secret
```

* Rename the ```sample_env``` file to ```.env``` or if your going to put this app into production, then create a blank ```.env``` file and store the Node environment variables security.
```
mv sample_env .env
```
* Update the ```.env``` file with the Tenant Id, Client Id, and Client Secret that you obtained.
```
AZURE_TENANT_ID=<your_tenant_id>
AZURE_CLIENT_ID=<your_client_id>
AZURE_CLIENT_SECRET=<your_client_secret_id>
AZURE_MANAGEMENT_URL="https://management.azure.com"
AZURE_LOGIN_URL="https://login.microsoftonline.com"
PORT=8000
API_KEY=sampleKey
```

* Install the packages
```
npm i
```

* Start of the server
```
start-local
```

* Browse to [http://localhost:8000](http://localhost:8000).
* Browse to [http://localhost:8000/all?startDate=2017-07-01&endDate=2017-07-30&apiKey=sampleKey](http://localhost:8000/all?startDate=2017-07-01&endDate=2017-07-30&apiKey=sampleKey). When you hit this endpoint, it will fetch hit the Azure REST API's to collect and aggregate your data and display a JSON payload.
