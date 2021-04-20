.PHONY: clean
clean:
	-rm -rf node_modules
	-rm -rf packages/clicker/node_modules
	-rm -rf packages/desktop/node_modules
	-rm -rf packages/common/node_modules

.PHONY: all
all: build-desktop build-android

.PHONY: desktop-server
desktop-serve:
	npm run electron:serve --prefix packages/desktop

.PHONY: build-desktop
build-desktop:
	cd packages/desktop && \
		npm run electron:build

.PHONY: build-android
build-android:
	# run jetifier for qrcode-scanner compat
	# see: https://github.com/bitpay/cordova-plugin-qrscanner/issues/319#issuecomment-651862009
	cd packages/clicker && \
		npx jetify && \
		ionic cap sync android && \
		npm run android:build
