# rustwasm
mkdir -p .public/.wasm
cd rustwasm
wasm-pack build --target web
cd ..
mv rustwasm/pkg/springbox_bg.wasm .public/.wasm/index.wasm
mv rustwasm/pkg/springbox.js .public/.wasm/index.js
# static
cp -r static/* .public