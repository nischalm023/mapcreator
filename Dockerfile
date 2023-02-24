FROM node:9.11.1-alpine
RUN apk update && apk add bash
# client
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install
# to fix https://bitbucket.org/site/master/issues/17319/docker-builds-started-failing-with
# fix described here: https://community.atlassian.com/t5/Bitbucket-articles/Changes-to-make-your-containers-more-secure-on-Bitbucket/ba-p/998464
RUN chown -R root:root /app/client/node_modules
COPY client/ .
ENV NODE_PATH ./src/
ENV NODE_ENV production
ARG version=unknown
ENV REACT_APP_VERSION ${version}
# public_url for testing server (needed so static file urls are correct in index.html)
ARG public_url
ENV PUBLIC_URL ${public_url}
# basename for testing server (needed for react router to work)
ARG basename
ENV REACT_APP_BASENAME ${basename}
#ARG basename_autocad
#ENV REACT_APP_BASENAME_AUTOCAD ${basename_autocad}
# to indicate that redux logger should be kept in the build (eg. for testing instance build)
ARG keep_redux_logger
ENV REACT_APP_KEEP_REDUX_LOGGER ${keep_redux_logger}
RUN npm run build


# server
FROM node:9.11.1-alpine
USER root
RUN apk update && apk add bash
WORKDIR /app
ENV PORT 3001
ENV DATABASE_URL postgres://postgres:postgres@mapcreator_db:5432/mapcreator
COPY package.json package-lock.json .babelrc ./
# need node env development for install since for some reason babel is in dev dependencies...
ENV NODE_ENV development
RUN npm install
ENV NODE_ENV production

# babel stuff
COPY --from=0 /app/client/build/ dist/client/build/
# copy all src files of client since some required in migrations
# also copy node_modules since they will also be needed... this makes deploy quite bulky though
COPY --from=0 /app/client/src/ client/src/
COPY --from=0 /app/client/node_modules/ client/node_modules/
COPY server/ ./server/
RUN npm run build
COPY entrypoint.sh wait-for-it.sh ./ 
RUN chmod +x entrypoint.sh
RUN chmod +x wait-for-it.sh
ENTRYPOINT ["./entrypoint.sh"]
