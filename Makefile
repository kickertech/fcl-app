.PHONY: clean
clean:
	npx lerna clean --yes
	-rm -rf node_modules

.PHONY: prepare
prepare:
	npm i -g @ionic/cli
	npx lerna bootstrap --hoist

.PHONY: all
all: build-desktop build-android

.PHONY: desktop-server
desktop-serve:
	npx lerna run electron:serve

.PHONY: build-desktop
build-desktop:
	npx lerna run electron:build

.PHONY: build-android
build-android:
	# run jetifier for qrcode-scanner compat, see: https://github.com/bitpay/cordova-plugin-qrscanner/issues/319#issuecomment-651862009
	npx jetify
	cd packages/clicker && ionic cap sync android

	npx lerna run android:build
