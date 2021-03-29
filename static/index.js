import initWasm, {Scene} from "./.wasm/index.js";

const WASM_URL = "./.wasm/index.wasm";

//#region Arbitrary constants

const MAX_TIMESTEP = 1 / 30;
const INITIAL_POSITION_RADIUS = 15;
const INITIAL_VELOCITY_RADIUS = 240;
const INITIAL_MASS = 1;
const INITIAL_SPRING_RATE = 30;
const INITIAL_DRAG = 4;
const MAX_DRAG = 80;

const MAX_N_FRACTION_DIGITS = 4;
//#endregion

//#region Vue preinitialization

let vue;
const vueModuleUrl = new URLSearchParams(location.search).has("development")
		? "https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js"
		: "https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.min.js";
//#endregion

//#region Elements

const svg = document.querySelector("svg");
const space = document.querySelector("#space");
const disc = document.querySelector("#disc-container");
const line = document.querySelector("#line");
//#endregion

//#region Util functions

function svgCoordsFromPageCoords(pageX, pageY) {
	const svgPoint = svg.createSVGPoint();
	svgPoint.x = pageX;
	svgPoint.y = pageY;
	return svgPoint.matrixTransform(space.getScreenCTM().inverse());
}

/* const f32RoundingFormat = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 1,
	maximumFractionDigits: MAX_N_FRACTION_DIGITS,
}); */
function roundF32(f32) {
	return Number(f32.toFixed(MAX_N_FRACTION_DIGITS));
}

function updateDisplayPosition(x, y) {
	disc.setAttribute("transform", `translate(${x}, ${y})`);

	line.setAttribute("x2", x);
	line.setAttribute("y2", y);

	vue?.$forceUpdate();
}

function updateDisplayPositionToSceneBody(sceneBody) {
	updateDisplayPosition(sceneBody.positionX, sceneBody.positionY);
}
//#endregion

//#region Factories

function createSceneTicker(sceneBody) {
	let timeoutHandle = 0;
	let animationFrameHandle = 0;

	let prevTimeoutTime = -Infinity;

	return {
		timeoutTickAction(now) {
			const timestep = Math.max(0, Math.min(MAX_TIMESTEP, (now - prevTimeoutTime) / 1000));
			sceneBody.tick(timestep);
			
			prevTimeoutTime = now;

			// Failsafe
			if (!sceneBody.hasFinitePosVel()) {
				sceneBody.setPosition(0, 0);
				sceneBody.setVelocity(0, 0);
			}
	
			this.timeoutTick();
		},

		animationFrameTickAction() {
			updateDisplayPositionToSceneBody(sceneBody);

			this.animationFrameTick();
		},

		timeoutTick() {
			timeoutHandle = setTimeout(() => this.timeoutTickAction(Date.now()));
		},

		animationFrameTick() {
			animationFrameHandle = requestAnimationFrame(() => this.animationFrameTickAction());
		},

		tick() {
			this.timeoutTick();
			this.animationFrameTick();
		},

		cancel() {
			clearTimeout(timeoutHandle);
			cancelAnimationFrame(animationFrameHandle);
			timeoutHandle = 0;
			animationFrameHandle = 0;
		},

		get active() {
			return animationFrameHandle !== 0;
		},
		set active(value) {
			if (value && !this.active) {
				this.tick();
			} else {
				this.cancel();
			}
		}
	};
}

function createEngine() {
	const engine = {
		sceneBody: new Scene(),
		ticker: null,
	};
	
	engine.sceneBody.setPosition(INITIAL_POSITION_RADIUS * (Math.random() * 2 - 1), INITIAL_POSITION_RADIUS * (Math.random() * 2 - 1));
	engine.sceneBody.mass = INITIAL_MASS;

	engine.sceneBody.springRate = INITIAL_SPRING_RATE;
	engine.sceneBody.drag = INITIAL_DRAG;

	engine.sceneBody.setVelocity(INITIAL_VELOCITY_RADIUS * (Math.random() * 2 - 1), INITIAL_VELOCITY_RADIUS * (Math.random() * 2 - 1));

	engine.ticker = createSceneTicker(engine.sceneBody);

	return Object.freeze(engine);
}
//#endregion

//#region Main

(async () => {
	const wasmPromise = initWasm(WASM_URL);

	const [, {default: Vue}] = await Promise.all([
		wasmPromise,
		import(vueModuleUrl),
	]);

	const engine = createEngine();

	//#region Vue

	const validate = {
		mass(value) {
			return value > 0;
		},

		springRate(value) {
			return value >= 0;
		},

		drag(value) {
			return 0 <= value && value <= MAX_DRAG;
		},

		gravityAccelerationX: isFinite,
		gravityAccelerationY: isFinite,
	};

	// `temp` is saved so that `vue.$forceReload` does not reset input
	// If a field !== null, then the field is not finished from editing (`input` event fired, but `change` event not fired)
	const temp = {};
	for (const key of Object.keys(validate)) {
		temp[key] = null;
	}

	vue = new Vue({
		el: "aside",
		data: {
			// maybe DRY this
 			get positionX() {
				return roundF32(engine.sceneBody.positionX);
			},
			get positionY() {
				return roundF32(engine.sceneBody.positionY);
			},

			get velocityX() {
				return roundF32(engine.sceneBody.velocityX);
			},
			get velocityY() {
				return roundF32(engine.sceneBody.velocityY);
			},

			temp,
			get mass() {
				return this.temp.mass ?? roundF32(engine.sceneBody.mass);
			},
			get springRate() {
				return this.temp.springRate ?? roundF32(engine.sceneBody.springRate);
			},
			get drag() {
				return this.temp.drag ?? roundF32(engine.sceneBody.drag);
			},
			get gravityAccelerationX() {
				return this.temp.gravityAccelerationX ?? roundF32(engine.sceneBody.gravityAccelerationX);
			},
			get gravityAccelerationY() {
				return this.temp.gravityAccelerationY ?? roundF32(engine.sceneBody.gravityAccelerationY);
			},

			active: true,
			get toggleButtonText() {
				return this.active ? "❚❚ Stop" : "▶ Resume";
			},
		},

		methods: {
			fieldInput(event) {
				const propertyName = event.currentTarget.getAttribute("data-property-name");
				const newValue = vue.$data.temp[propertyName] = event.currentTarget.value;
		
				if (validate[propertyName]?.(newValue) ?? true) {
					engine.sceneBody[propertyName] = newValue;
					event.currentTarget.classList.remove("error");
				} else {
					event.currentTarget.classList.add("error");
				}
			},

			fieldChange(event) {
				const propertyName = event.currentTarget.getAttribute("data-property-name");

				vue.$data.temp[propertyName] = null;
				vue.$forceUpdate();
		
				event.currentTarget.classList.remove("error");
			},

			toggle() {
				engine.ticker.active = vue.$data.active = !vue.$data.active;
			},

			resetPosition() {
				engine.sceneBody.setPosition(0, 0);
				engine.sceneBody.setVelocity(0, 0);

				updateDisplayPositionToSceneBody(engine.sceneBody);
			},
		},
	});
	//#endregion

	//#region Events

	(() => {
		let lastFrameTime = NaN;
		const lastPosition2 = {x: NaN, y: NaN};
		const lastPosition = {x: NaN, y: NaN};

		function setPositionFromMouseEvent(mouseEvent) {
			const point = svgCoordsFromPageCoords(mouseEvent.pageX, mouseEvent.pageY);

			const {x, y} = point;
			engine.sceneBody.setPosition(x, y);

			return point;
		}

		function setVelocityFromComputation() {
			const timeDiff = (Date.now() - lastFrameTime) / 1000;

			const velocityX = (lastPosition.x - lastPosition2.x) / timeDiff;
			const velocityY = (lastPosition.y - lastPosition2.y) / timeDiff;

			engine.sceneBody.setVelocity(velocityX, velocityY);
		}

		let velocityAnimationFrameHandle = null;
		function velocityTick() {
			setVelocityFromComputation();

			updateDisplayPositionToSceneBody(engine.sceneBody);

			Object.assign(lastPosition2, lastPosition);
			lastFrameTime = Date.now();
			
			velocityAnimationFrameHandle = requestAnimationFrame(velocityTick);
		}

		svg.addEventListener("mousedown", event => {
			event.preventDefault();
		});

		disc.addEventListener("mousedown", event => {
			if (event.button !== 0) return;

			engine.ticker.cancel();
			cancelAnimationFrame(velocityAnimationFrameHandle);
			velocityAnimationFrameHandle = requestAnimationFrame(velocityTick);

			const pos = setPositionFromMouseEvent(event);
			lastPosition.x = pos.x;
			lastPosition.y = pos.y;

			addEventListener("mousemove", onmousemove);
			addEventListener("mouseup", onmouseup, {once: true});
		});

		function onmousemove(event) {
			const pos = setPositionFromMouseEvent(event);
			lastPosition.x = pos.x;
			lastPosition.y = pos.y;
		}
		
		function onmouseup() {
			cancelAnimationFrame(velocityAnimationFrameHandle);
			removeEventListener("mousemove", onmousemove);

			setVelocityFromComputation();

			engine.ticker.active = vue.$data.active;
		}
	})();
	//#endregion

	// Start now
	engine.ticker.tick();
})();
//#endregion