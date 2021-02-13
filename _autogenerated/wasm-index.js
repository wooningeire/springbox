
let wasm;

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
*/
export class Scene {

    static __wrap(ptr) {
        const obj = Object.create(Scene.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_scene_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.scene_new();
        return Scene.__wrap(ret);
    }
    /**
    * @param {number} timestep
    */
    tick(timestep) {
        wasm.scene_tick(this.ptr, timestep);
    }
    /**
    * @param {number} x
    * @param {number} y
    */
    setPosition(x, y) {
        wasm.scene_setPosition(this.ptr, x, y);
    }
    /**
    * @returns {number}
    */
    get positionX() {
        var ret = wasm.scene_positionX(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get positionY() {
        var ret = wasm.scene_positionY(this.ptr);
        return ret;
    }
    /**
    * @param {number} x
    * @param {number} y
    */
    setVelocity(x, y) {
        wasm.scene_setVelocity(this.ptr, x, y);
    }
    /**
    * @returns {number}
    */
    get velocityX() {
        var ret = wasm.scene_velocityX(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get velocityY() {
        var ret = wasm.scene_velocityY(this.ptr);
        return ret;
    }
    /**
    * @param {number} mass
    */
    set mass(mass) {
        wasm.scene_set_mass(this.ptr, mass);
    }
    /**
    * @returns {number}
    */
    get mass() {
        var ret = wasm.scene_mass(this.ptr);
        return ret;
    }
    /**
    * @param {number} spring_rate
    */
    set springRate(spring_rate) {
        wasm.scene_set_springRate(this.ptr, spring_rate);
    }
    /**
    * @returns {number}
    */
    get springRate() {
        var ret = wasm.scene_springRate(this.ptr);
        return ret;
    }
    /**
    * @param {number} x
    * @param {number} y
    */
    setSpringEquilibriumPosition(x, y) {
        wasm.scene_setSpringEquilibriumPosition(this.ptr, x, y);
    }
    /**
    * @param {number} x
    * @param {number} y
    */
    setGravityAcceleration(x, y) {
        wasm.scene_setGravityAcceleration(this.ptr, x, y);
    }
    /**
    * @returns {number}
    */
    get gravityAccelerationX() {
        var ret = wasm.scene_gravityAccelerationX(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    get gravityAccelerationY() {
        var ret = wasm.scene_gravityAccelerationY(this.ptr);
        return ret;
    }
    /**
    * @param {number} x
    */
    set gravityAccelerationX(x) {
        wasm.scene_set_gravityAccelerationX(this.ptr, x);
    }
    /**
    * @param {number} y
    */
    set gravityAccelerationY(y) {
        wasm.scene_set_gravityAccelerationY(this.ptr, y);
    }
    /**
    * @param {number} drag
    */
    set drag(drag) {
        wasm.scene_set_drag(this.ptr, drag);
    }
    /**
    * @returns {number}
    */
    get drag() {
        var ret = wasm.scene_drag(this.ptr);
        return ret;
    }
    /**
    * @returns {boolean}
    */
    hasFinitePosVel() {
        var ret = wasm.scene_hasFinitePosVel(this.ptr);
        return ret !== 0;
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}

export default init;

