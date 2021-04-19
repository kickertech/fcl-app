.PHONY: clean
clean:
	-rm -rf node_modules
	-rm -rf packages/clicker/node_modules
	-rm -rf packages/desktop/node_modules
	-rm -rf packages/common/node_modules

.PHONY: prepare
prepare:
	npm i -g @ionic/cli

.PHONY: prepare-desktop
prepare-desktop:
	npm install --prefix packages/desktop

.PHONY: prepare-android
prepare-android:
	npm install --prefix packages/clicker

.PHONY: all
all: build-desktop build-android

.PHONY: desktop-server
desktop-serve:
	npm run electron:serve --prefix packages/desktop

.PHONY: build-desktop
build-desktop: prepare-desktop
	npm run electron:build --prefix packages/desktop

.PHONY: build-android
build-android: prepare-android
	# run jetifier for qrcode-scanner compat
	# see: https://github.com/bitpay/cordova-plugin-qrscanner/issues/319#issuecomment-651862009
	cd packages/clicker && npx jetify && ionic cap sync android
	npm run android:build --prefix packages/clicker
