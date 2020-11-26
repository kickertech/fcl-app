.PHONY: clean
clean:
	npx lerna clean --yes

.PHONY: prepare
prepare:
	npm i -g vue@^3.0.0 # this is linked
	npm install
	npx lerna bootstrap
	npx lerna link --loglevel=debug --force-local
	# we have to link vue otherwise reactive won't work because it's loaded from multiple packages/paths
	npx lerna exec -- npm link vue

.PHONY: all
all: build-desktop build-android

.PHONY: desktop-server
desktop-serve:
	npm run electron:serve --prefix ./packages/desktop

.PHONY: build-desktop
build-desktop:
	npm run electron:build --prefix ./packages/desktop

.PHONY: build-android
build-android:
	npm run android:build --prefix ./packages/clicker
