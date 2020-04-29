[![Known Vulnerabilities](https://snyk.io/test/github/DEFRA/ffc-demo-claim-service/badge.svg?targetFile=package.json)](https://snyk.io/test/github/DEFRA/ffc-demo-claim-service?targetFile=package.json)

# FFC Demo Claim Service

Digital service mock to claim public money in the event property subsides into mine shaft.  The claim service receives claim data and if doesn’t already exist saves it in a Postgresql database table.  It also publishes events to message queues that a new claim has been received.

## Prerequisites

Either:
- Docker
- Docker Compose

Or:
- Kubernetes
- Helm

Or:
- Node 10
- PostgreSQL database
- AWS SQS compatible message queue

## Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

| Name                             | Description                    | Required | Default   | Valid                       | Notes                             |
|----------------------------------|--------------------------------|:--------:|-----------|:---------------------------:|-----------------------------------|
| NODE_ENV                         | Node environment               | no       |           | development,test,production |                                   |
| PORT                             | Port number                    | no       | 3003      |                             |                                   |
| POSTGRES_DB                      | Postgres database              | yes      |           |                             |                                   |
| POSTGRES_USERNAME                | Postgres username              | yes      |           |                             |                                   |
| POSTGRES_PASSWORD                | Postgres password              | yes      |           |                             |                                   |
| CALCULATION_QUEUE_NAME           | Message queue name             | yes      |           |                             |                                   |
| CALCULATION_ENDPOINT             | Message base url               | no       |           |                             |                                   |
| CALCULATION_QUEUE_URL            | Message queue url              | yes      |           |                             |                                   |
| CALCULATION_QUEUE_REGION         | AWS region                     | no       | eu-west-2 |                             |Ignored in local dev               |
| DEV_ACCESS_KEY_ID                | Local dev only access key Id   | no       |           |                             |                                   |
| DEV_ACCESS_KEY                   | Local dev only access key Id   | no       |           |                             |                                   |
| CREATE_CALCULATION_QUEUE         | Create queue before connection | no       | false     |                             | For local development set to true |
| SCHEDULE_QUEUE_NAME              | Message queue name             | yes      |           |                             |                                   |
| SCHEDULE_ENDPOINT                | Message base url               | yes      |           |                             |                                   |
| SCHEDULE_QUEUE_URL               | Message queue url              | no       |           |                             |                                   |
| SCHEDULE_QUEUE_REGION            | AWS region                     | no       | eu-west-2 |                             | Ignored in local dev              |
| CREATE_SCHEDULE_QUEUE            | Create queue before connection | no       | false     |                             | For local development set to true |
| CLAIM_QUEUE_NAME                 | Message queue name             | yes      |           |                             |                                   |
| CLAIM_ENDPOINT                   | Message base url               | yes      |           |                             |                                   |
| CLAIM_QUEUE_URL                  | Message queue url              | no       |           |                             |                                   |
| CLAIM_QUEUE_REGION               | AWS region                     | no       | eu-west-2 |                             | Ignored in local dev              |
| CREATE_CLAIM_QUEUE               | Create queue before connection | no       | false     |                             | For local development set to true |

## How to run tests

A convenience script is provided to run automated tests in a containerised environment. The first time this is run, container images required for testing will be automatically built. An optional `--build` (or `-b`) flag may be used to rebuild these images in future (for example, to apply dependency updates).

```
# Run tests
scripts/test

# Rebuild images and run tests
scripts/test --build
```

This runs tests via a `docker-compose run` command. If tests complete successfully, all containers, networks and volumes are cleaned up before the script exits. If there is an error or any tests fail, the associated Docker resources will be left available for inspection.

Alternatively, the same tests may be run locally via npm:

```
# Run tests without Docker
npm run test
```

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

By default, the start script will build (or rebuild) images so there will rarely be a need to build images manually. However, this can be achieved through the Docker Compose [build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start and stop the service

Use Docker Compose to run service locally.

`docker-compose up`

Additional Docker Compose files are provided for scenarios such as linking to other running services.

Link to other services:
```
docker-compose -f docker-compose.yaml -f docker-compose.link.yaml up
```

### Test the service

The service binds to a port on the host machine so it can be tested manually by sending HTTP requests to the bound port using a tool such as [Postman](https://www.getpostman.com) or `curl`.

```
# Send a sample request to the /submit endpoint
curl  -i --header "Content-Type: application/json" \
  --request POST \
  --data '{ "claimId": "MINE123", "propertyType": "business",  "accessible": false,   "dateOfSubsidence": "2019-07-26T09:54:19.622Z",  "mineType": ["gold"] }' \
  http://localhost:3003/submit
```

Sample valid JSON for the `/submit` endpoint is:

```
{  "claimId": "MINE123",  "propertyType": "business",  "accessible": false,  "dateOfSubsidence": "2019-07-26T09:54:19.622Z",  "mineType": ["gold"] }
```

### Test the message queue

This service reacts to messages retrieved from an AWS SQS message queue (the "claim" queue). It can be tested locally with:

```
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'Action=SendMessage&MessageBody={"claimId":"MINE123","propertyType":"business","accessible":false,"dateOfSubsidence":"2019-07-26T09:54:19.622Z","mineType":["gold"],"email":"joe.bloggs@defra.gov.uk"}' "http://localhost:9324/queue/claim"
```

### Link to sibling services

To test interactions with sibling services in the FFC demo application, it is necessary to connect each service to an external Docker network, along with shared dependencies such as message queues. The most convenient approach for this is to start the entire application stack from the [`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development) repository.

It is also possible to run a limited subset of the application stack. See the [`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development) Readme for instructions.

### Deploy to Kubernetes

For production deployments, a helm chart is included in the `.\helm` folder. This service connects to an sqs message broker, using credentials defined in [values.yaml](./helm/ffc-demo-claim-service/values.yaml), which must be made available prior to deployment.

Scripts are provided to test the Helm chart by deploying the service, along with an appropriate message broker, into the current Helm/Kubernetes context.

```
# Deploy to current Kubernetes context
scripts/helm/install

# Remove from current Kubernetes context
scripts/helm/delete
```

#### Accessing the pod

By default, the service is not exposed via an endpoint within Kubernetes.

Access may be granted by forwarding a local port to the deployed pod:

```
# Forward local port to the Kubernetes deployment
kubectl port-forward --namespace=ffc-demo deployment/ffc-demo-claim-service 3003:3003
```
Once the port is forwarded, the service can be accessed and tested in the same way as described in the "Test the service" section above.

#### Probes

The service has both an Http readiness probe and an Http liveness probe configured to receive at the below end points.

Readiness: `/healthy`
Liveness: `/healthz`

# Run the NPM update
scripts/exec npm update

# Rebuild and restart the service
scripts/start --clean

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

