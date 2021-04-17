PREFIX = $(shell npm prefix -g)

.PHONY: clean
clean:
	npx lerna clean --yes

.PHONY: prepare
prepare:
	npm i vue@^3.0.0 # this is linked
	npm i -g @ionic/cli
	npm install
	npx lerna bootstrap --ci
	npx lerna link --loglevel=debug --force-local
	# we have to link vue otherwise reactive won't work because it's loaded from multiple packages/paths
	npx lerna exec -- rm -rf node_modules/vue
	npx lerna exec -- ln -s $(PREFIX)/lib/node_modules/vue ./node_modules/vue

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
