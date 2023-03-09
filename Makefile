NAME		:= mapcreator
TAG			:= $$(echo $${BITBUCKET_COMMIT:-$$(git rev-parse HEAD)} | cut -c1-7)
VERSION			:=  $(shell git describe --dirty)
REPO		:= us-docker.pkg.dev/greymatter-development/apps
BASENAME	:= ${REPO}/${NAME}
IMG			:= ${BASENAME}:${TAG}
STAGING:= ${BASENAME}:staging
# testing is only for phab diffs
REVISION_WITH_D := D${REVISION}
TESTING := ${BASENAME}:${REVISION_WITH_D}
LATEST		:= ${BASENAME}:latest
SERVER_SSH	:= root@mapcreator.labs.greyorange.com
GCP_REPO	:= us-docker.pkg.dev
GCP_BASENAME	:= ${GCP_REPO}/greymatter-development/apps/${NAME}
GCP_IMG		:= ${GCP_BASENAME}:${TAG}
GCP_BRANCH		:= ${GCP_BASENAME}:${BRANCH}
GCP_EXPERIMENTAL	:= ${GCP_BASENAME}:experimental
GCP_LATEST	:= ${GCP_BASENAME}:latest
GCP_STAGING:= ${GCP_BASENAME}:staging
GCP_TESTING := ${GCP_BASENAME}:${REVISION_WITH_D}

.PHONY: check-uncommitted all

check-uncommitted:
    ifneq ($(shell echo `git status -s`),)
		$(error Please commit files before building.)
    endif

build-no-check:
	docker build --build-arg version=${VERSION} -t ${IMG} -t ${GCP_IMG} -t ${GCP_BRANCH} .

build: check-uncommitted build-no-check

push:
# docker push ${IMG}
	docker push ${GCP_IMG}
	docker push ${GCP_BRANCH}

push-as-latest: check-uncommitted
# docker pull ${IMG}
	docker pull ${GCP_IMG}
#	docker tag ${IMG} ${LATEST}
	docker tag ${GCP_IMG} ${GCP_LATEST} ${GCP_BRANCH}
# docker push ${LATEST}
	docker push ${GCP_LATEST}
	docker push ${GCP_BRANCH}

push-as-staging:
#	docker pull ${IMG}
#	docker tag ${IMG} ${STAGING}
#	docker push ${STAGING}
	docker pull ${GCP_IMG}
	docker tag ${GCP_IMG} ${GCP_STAGING}
	docker push ${GCP_STAGING}

all: build push push-as-latest

testing:
	docker build -t ${TESTING} \
		--build-arg version="${REVISION_WITH_D}-${VERSION}" \
		--build-arg public_url="http://mapcreator.labs.greyorange.com:5000/${REVISION_WITH_D}/" \
		--build-arg basename="/${REVISION_WITH_D}" \
		--build-arg keep_redux_logger=true .
	docker tag ${TESTING} ${GCP_TESTING}
	docker push ${GCP_TESTING}

staging:
	docker build -t ${STAGING} --build-arg version=${VERSION} .
	docker tag ${STAGING} ${GCP_STAGING}
	docker push ${GCP_STAGING}

deploy-staging:
	# adding prune to clear up old images
	ssh ${SERVER_SSH} 'cd mapcreator-staging && docker-compose pull web && docker-compose up -d && docker image prune -af'

deploy:
	# adding prune to clear up old images
	ssh ${SERVER_SSH} 'cd mapcreator && docker-compose pull web && docker-compose up -d && docker image prune -af'

login:
# do this before any other command. set env variables for docker login (contact vivek.r@greyorange.sg)
	docker login ${REPO} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}

lint:
	npm run lint-no-fix

test-client:
	cd client && npm install
	cd client && CI=true NODE_PATH=src/ npm test -- --coverage --reporters=default --reporters=jest-junit

test-server:
	npm install
	NODE_ENV=test npm run migrate
	NODE_ENV=test npm run test-server-ci

test: test-client test-server

test-tag:
	echo ${TAG}

test-version:
	echo ${VERSION}

test-testing-tag:
	echo ${TESTING}
