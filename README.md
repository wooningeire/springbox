# springbox
Play with a ball on a spring.

## parameters
Adding a query parameter named `development` to the URL will cause the page to load a development script of VueJS. Otherwise, it will load the production script.

## meta

### building
Building can be done by running `./build.sh`. [wasm-pack should be installed](https://rustwasm.github.io/wasm-pack/book/quickstart.html) first.

By default, the script will build to `./.public/`. It also assumes the rustwasm project name is "`springbox`".