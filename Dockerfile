ARG PARENT_VERSION=1.2.1-node14.15.0
# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
ARG NPM_REGISTRY
ARG NPM_TOKEN
ARG NPM_EMAIL

LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ARG PORT_DEBUG=9229
EXPOSE ${PORT_DEBUG}

COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
ARG PORT
ARG NPM_REGISTRY
ARG NPM_TOKEN
ARG NPM_EMAIL

LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ENV PORT ${PORT}
EXPOSE ${PORT}

COPY --chown=node:node package*.json .npmrc* /home/node/
COPY --from=development /home/node/app  /home/node/app
RUN npm --verbose ci
RUN rm -f .npmrc
CMD [ "node", "app" ]
