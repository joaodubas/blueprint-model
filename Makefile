ROOT=$(CURDIR)
DOCKER=/usr/bin/docker
DOCKER_DIR=/opt/app
DOCKER_MOUNT=$(ROOT):$(DOCKER_DIR)
DOCKER_IMAGE_STABLE=joaodubas/nodejs:latest
DOCKER_IMAGE=$(DOCKER_IMAGE_STABLE)
DOCKER_NAME=blueprint-model
NPM=/usr/local/bin/npm
NODE=/usr/local/bin/node
CMD=$(DOCKER) run -i -t -name $(DOCKER_NAME) -v $(DOCKER_MOUNT) -w $(DOCKER_DIR)
CMD_NPM=$(CMD) -entrypoint $(NPM) $(DOCKER_IMAGE)
CMD_NODE=$(CMD) -entrypoint $(NODE) $(DOCKER_IMAGE)

install:
	@$(CMD_NPM) install $(args)
	@$(MAKE) kill

shell:
	@$(CMD_NODE) --harmony
	@$(MAKE) kill

test:
	@$(CMD_NPM) test
	@$(MAKE) kill

kill:
	@$(DOCKER) kill $(DOCKER_NAME) \
		&& $(DOCKER) rm $(DOCKER_NAME)

.PHONY: shell kill test
