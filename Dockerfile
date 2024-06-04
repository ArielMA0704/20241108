FROM node:18.20.3
# :16.6.2-alpine3.14
WORKDIR /quasar
COPY ./yarn.lock /quasar/yarn.lock
# RUN npm install -g @quasar/cli
# RUN npm install
RUN ls -la
# RUN yarn
RUN yarn global add @quasar/cli
# RUN yarn global add cordova
# RUN cordova telemetry on
