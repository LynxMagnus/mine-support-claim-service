ARG PARENT_VERSION=1.2.1-node14.15.0
#ARG NPM_REGISTRY=https://artifactoryv2.azure.defra.cloud/artifactory/npm-virtual/
# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ARG PORT_DEBUG=9229
EXPOSE ${PORT_DEBUG}

COPY --chown=node:node package*.json ./
#ARG NPM_REGISTRY
#RUN npm config set registry ${NPM_REGISTRY}
RUN npm install   
COPY --chown=node:node . .
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
ARG PORT
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ENV PORT ${PORT}
EXPOSE ${PORT}

COPY --from=development /home/node/package*.json /home/node/
COPY --from=development /home/node/app  /home/node/app
#ARG NPM_REGISTRY
#RUN npm config set registry ${NPM_REGISTRY}
RUN npm ci
CMD [ "node", "app" ]
