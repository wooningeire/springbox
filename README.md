# springbox
A ball on a spring.

Small and dirty project to learn and practice basic [Rust](https://www.rust-lang.org/) with [wasm-pack](https://github.com/rustwasm/wasm-pack) and [VueJS](https://vuejs.org/).

## building
The version in this repository has already been built.

[wasm-pack should be set up](https://rustwasm.github.io/wasm-pack/book/quickstart.html).
1. In the command line, change to the `./rustwasm/` directory.
2. Run [`wasm-pack build --target web`](https://rustwasm.github.io/wasm-pack/book/commands/build.html).
3. Within the `./rustwasm/pkg/` directory, rename `springbox_bg.wasm` to `index.wasm` and rename `springbox.js` to `wasm-index.js`.
4. Move `index.wasm` and `wasm-index.js` to the `./_autogenerated/` directory.

## todo
The building can probably be automated with CI/CD.
