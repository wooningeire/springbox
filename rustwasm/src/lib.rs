use wasm_bindgen::prelude::*;

type Vec2 = [f32; 2];

trait Vector<T> {
/* 	fn cis(angle: f32) -> T;

	fn angle_to(&self, other: &T) -> f32; */
	fn dist(&self, other: &T) -> f32;
	fn scaled(&self, scalar: f32) -> T;
	fn added(&self, other: &T) -> T;
	fn subtracted(&self, other: &T) -> T;
	fn mag(&self) -> f32;
	fn normalized(&self) -> T;
	fn with_mag(&self, mag: f32) -> T;
	fn is_finite(&self) -> bool;
}

impl Vector<Vec2> for Vec2 {
/* 	fn cis(angle: f32) -> Vec2 {
		[angle.cos(), angle.sin()]
	}

	fn angle_to(&self, other: &Vec2) -> f32 {
		(other[1] - self[1]).atan2(other[0] - self[0])
	} */

	fn dist(&self, other: &Vec2) -> f32 {
		(other[0] - self[0]).hypot(other[1] - self[1])
	}

	fn scaled(&self, scalar: f32) -> Vec2 {
		[self[0] * scalar, self[1] * scalar]
	}

	fn added(&self, other: &Vec2) -> Vec2 {
		[self[0] + other[0], self[1] + other[1]]
	}

	fn subtracted(&self, other: &Vec2) -> Vec2 {
		[self[0] - other[0], self[1] - other[1]]
	}

	fn mag(&self) -> f32 {
		self[0].hypot(self[1])
	}

	fn normalized(&self) -> Vec2 {
		let mag = self.mag();

		if mag == 0. {
			[0., 0.]
		} else {
			self.scaled(1. / mag)
		}
	}

	fn with_mag(&self, mag: f32) -> Vec2 {
		self.normalized().scaled(mag)
	}

	fn is_finite(&self) -> bool {
		self[0].is_finite() && self[1].is_finite()
	}
}

pub struct BodyForces {
	spring_rate: f32, // N / m
	spring_equilibrium_position: Vec2, // m

	gravity_acceleration: Vec2, // m / s^2

	drag: f32, // N * s / m
}

impl BodyForces {
	fn new() -> BodyForces {
		BodyForces {
			spring_rate: 100.,
			spring_equilibrium_position: [0., 0.],

			gravity_acceleration: [0., -9.81],

			drag: 0.5,
		}
	}

	fn forces_on_body(&self, body: &Body) -> Vec2 {
		let dist = self.spring_equilibrium_position.dist(&body.position);
		
		// F = k * x
		let spring_force = self.spring_equilibrium_position.subtracted(&body.position).with_mag(self.spring_rate * dist);

		// F = m * a
		let gravity_force = self.gravity_acceleration.scaled(body.mass);

		let drag_force = body.velocity.scaled(-self.drag);

		spring_force.added(&gravity_force).added(&drag_force)
	}
}

pub struct Body {
	mass: f32, // kg

	position: Vec2, // m
	velocity: Vec2, // m / s
	acceleration: Vec2, // m / s^2

	incoming_force: Vec2, // N
}

impl Body {
	fn new() -> Body {
		Body {
			mass: 1.,
			
			position: [0., 0.],
			velocity: [0., 0.],
			acceleration: [0., 0.],

			incoming_force: [0., 0.],
		}
	}

	// timestep : s
	fn tick(&mut self, timestep: f32) {
		// F = m * a
		self.acceleration = self.incoming_force.scaled(1f32 / self.mass);

		// Δv = a * Δt
		self.velocity = self.velocity.added(&self.acceleration.scaled(timestep));

		// Δs = v * Δt
		self.position = self.position.added(&self.velocity.scaled(timestep));
	}
}

#[wasm_bindgen]
pub struct Scene {
	environment: BodyForces,
	body: Body,
}

#[wasm_bindgen]
impl Scene {
	#[wasm_bindgen(constructor)]
	pub fn new() -> Scene {
		Scene {
			environment: BodyForces::new(),
			body: Body::new(),
		}
	}

	// timestep : s
	pub fn tick(&mut self, timestep: f32) {
		self.body.incoming_force = self.environment.forces_on_body(&self.body);
		self.body.tick(timestep);
	}

	#[wasm_bindgen(js_name = setPosition)]
	pub fn set_position(&mut self, x: f32, y: f32) {
		self.body.position[0] = x;
		self.body.position[1] = y;
	}

	#[wasm_bindgen(getter, js_name = positionX)]
	pub fn get_position_x(&self) -> f32 {
		self.body.position[0]
	}

	#[wasm_bindgen(getter, js_name = positionY)]
	pub fn get_position_y(&self) -> f32 {
		self.body.position[1]
	}

/* 	#[wasm_bindgen(setter, js_name = positionX)]
	pub fn set_position_x(&mut self, x: f32) {
		self.body.position[0] = x;
	}

	#[wasm_bindgen(setter, js_name = positionY)]
	pub fn set_position_y(&mut self, y: f32) {
		self.body.position[1] = y;
	} */

	#[wasm_bindgen(js_name = setVelocity)]
	pub fn set_velocity(&mut self, x: f32, y: f32) {
		self.body.velocity[0] = x;
		self.body.velocity[1] = y;
	}

	#[wasm_bindgen(getter, js_name = velocityX)]
	pub fn get_velocity_x(&self) -> f32 {
		self.body.velocity[0]
	}

	#[wasm_bindgen(getter, js_name = velocityY)]
	pub fn get_velocity_y(&self) -> f32 {
		self.body.velocity[1]
	}

	#[wasm_bindgen(setter, js_name = mass)]
	pub fn set_mass(&mut self, mass: f32) {
		self.body.mass = mass;
	}

	#[wasm_bindgen(getter, js_name = mass)]
	pub fn get_mass(&self) -> f32 {
		self.body.mass
	}

	#[wasm_bindgen(setter, js_name = springRate)]
	pub fn set_spring_rate(&mut self, spring_rate: f32) {
		self.environment.spring_rate = spring_rate;
	}

	#[wasm_bindgen(getter, js_name = springRate)]
	pub fn get_spring_rate(&self) -> f32 {
		self.environment.spring_rate
	}

	#[wasm_bindgen(js_name = setSpringEquilibriumPosition)]
	pub fn set_spring_equilibrium_position(&mut self, x: f32, y: f32) {
		self.environment.spring_equilibrium_position[0] = x;
		self.environment.spring_equilibrium_position[1] = y;
	}

	#[wasm_bindgen(js_name = setGravityAcceleration)]
	pub fn set_gravity_acceleration(&mut self, x: f32, y: f32) {
		self.environment.gravity_acceleration[0] = x;
		self.environment.gravity_acceleration[1] = y;
	}

	#[wasm_bindgen(getter, js_name = gravityAccelerationX)]
	pub fn get_gravity_acceleration_x(&self) -> f32 {
		self.environment.gravity_acceleration[0]
	}

	#[wasm_bindgen(getter, js_name = gravityAccelerationY)]
	pub fn get_gravity_acceleration_y(&self) -> f32 {
		self.environment.gravity_acceleration[1]
	}

	#[wasm_bindgen(setter, js_name = gravityAccelerationX)]
	pub fn set_gravity_acceleration_x(&mut self, x: f32) {
		self.environment.gravity_acceleration[0] = x;
	}

	#[wasm_bindgen(setter, js_name = gravityAccelerationY)]
	pub fn set_gravity_acceleration_y(&mut self, y: f32) {
		self.environment.gravity_acceleration[1] = y;
	}
	
	#[wasm_bindgen(setter, js_name = drag)]
	pub fn set_drag(&mut self, drag: f32) {
		self.environment.drag = drag;
	}

	#[wasm_bindgen(getter, js_name = drag)]
	pub fn get_drag(&self) -> f32 {
		self.environment.drag
	}

	#[wasm_bindgen(js_name = hasFinitePosVel)]
	pub fn has_finite_pos_vel(&self) -> bool {
		self.body.position.is_finite() && self.body.velocity.is_finite()
	}
}