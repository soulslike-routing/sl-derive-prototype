use js_sys::{Array, Map, Reflect};
use serde::{Deserialize, Deserializer};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

mod utils;

use wasm_bindgen::prelude::*;


// todo also consider lines for gate areas
#[wasm_bindgen]
pub fn derive_current_location(spec: &JsValue, model: &JsValue, state: &JsValue, already_updated_state_this_tick: &JsValue) -> Result<String, JsValue> {
    let radius_to_check_in_around_player: f64 = 4.0;
    let point_radius: f64 = 0.5;

    // prep: Compute distances for all points, in respect to their radius
    let player_state = Reflect::get(already_updated_state_this_tick, &JsValue::from_str("player"))?;
    let player_coords = Reflect::get(&player_state, &JsValue::from_str("position"))?;

    let player_coords_x: f64 = Reflect::get(&player_coords, &JsValue::from_str("x"))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str("Missing 'player.position.x' field"))?;

    let player_coords_y: f64 = Reflect::get(&player_coords, &JsValue::from_str("y"))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str("Missing 'player.position.y' field"))?;

    let player_coords_z: f64 = Reflect::get(&player_coords, &JsValue::from_str("z"))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str("Missing 'player.position.z' field"))?;

    struct NearbyPoint {
        coords: Vec<f64>,
        is_gate: bool,
        area_index: u32,
        location_index: u32
    };
    let mut points_nearby: Vec<NearbyPoint> = Vec::new();

    let model_areas = Array::from(&Reflect::get(model, &JsValue::from_str("areas"))?);
    for area_index in 0..model_areas.length() {
        let area = model_areas.get(area_index);
        let locations_in_current_area = Array::from(&Reflect::get(&area, &JsValue::from_str("locations"))?);
        for location_index in 0..locations_in_current_area.length() {
            let location = locations_in_current_area.get(location_index);
            let point_cloud = Reflect::get(&location, &JsValue::from_str("pointCloud"))?;
            let points = Map::from(Reflect::get(&point_cloud, &JsValue::from_str("points"))?);
            let point_keys = points.keys();
            for point_key in point_keys {
                let point = points.get(&point_key?);
                let point_coords = Reflect::get(&point, &JsValue::from_str("coords"))?;
                let point_coords_x: f64 = Reflect::get(&point_coords, &JsValue::from_str("x"))?
                    .as_f64()
                    .ok_or_else(|| JsValue::from_str("Missing 'point_coords_x' field"))?;

                let point_coords_y: f64 = Reflect::get(&point_coords, &JsValue::from_str("y"))?
                    .as_f64()
                    .ok_or_else(|| JsValue::from_str("Missing 'player_coords_y' field"))?;

                let point_coords_z: f64 = Reflect::get(&point_coords, &JsValue::from_str("z"))?
                    .as_f64()
                    .ok_or_else(|| JsValue::from_str("Missing 'player_coords_z' field"))?;
                // return Ok(format!("Point coords: x {}, y {}, z {}", point_coords_x, point_coords_y, point_coords_z));

                let distance = (
                    (player_coords_x - point_coords_x).powi(2) +
                        (player_coords_y - point_coords_y).powi(2) +
                        (player_coords_z - point_coords_z).powi(2)
                ).sqrt() - radius_to_check_in_around_player - point_radius;

                if distance < 0.0 {
                    let is_gate: bool = Reflect::get(&location, &JsValue::from_str("isGateArea"))?
                        .as_bool()
                        .ok_or_else(|| JsValue::from_str("Missing 'isGateArea' field"))?;
                    points_nearby.push(NearbyPoint{
                        coords: vec![point_coords_x, point_coords_y, point_coords_z],
                        is_gate,
                        area_index,
                        location_index
                    });
                }
            }
        }
    }

    // Is there a sphere, that collides and is in a gate area?
    for nearby_point in points_nearby.iter().clone() {
        if nearby_point.is_gate {
            let area = Array::from(&Reflect::get(model, &JsValue::from_str("areas"))?)
                .get(nearby_point.area_index);
            let location = Array::from(&Reflect::get(&area, &JsValue::from_str("locations"))?)
                .get(nearby_point.location_index);
            return Ok(Reflect::get(&location, &JsValue::from_str("id"))?
                .as_string()
                .ok_or_else(|| JsValue::from_str("Missing 'id' field"))?);
        }
    }

    // Else, what area do the majority of the spheres belong to?
    let mut tracker_map: HashMap<String, i32> = HashMap::new();

    for nearby_point in points_nearby {
        let obj_key = format!("{{\"area_index\": {}, \"location_index\": {}}}", nearby_point.area_index, nearby_point.location_index).to_string();
        // Update the value for the given key, defaulting to 0 if it doesn't exist
        let counter = tracker_map.entry(obj_key.clone()).or_insert(0);
        *counter += 1;
    }
    if tracker_map.is_empty() {
        return Err(JsValue::from("Tracker map is empty"));
    }
    let max_entry = tracker_map.iter()
        .max_by_key(|entry| entry.1)
        .map(|entry| entry.clone());

    if let Some(entry) = max_entry {
        #[derive(Deserialize)]
        struct Indexes {
            area_index: u32,
            location_index: u32
        }
        let parsed_location_index: Indexes = serde_json::from_str(entry.0).expect("JSON was not well-formatted");

        let area = Array::from(&Reflect::get(model, &JsValue::from_str("areas"))?)
            .get(parsed_location_index.area_index);
        let location = Array::from(&Reflect::get(&area, &JsValue::from_str("locations"))?)
            .get(parsed_location_index.location_index);
        return Ok(Reflect::get(&location, &JsValue::from_str("id"))?
            .as_string()
            .ok_or_else(|| JsValue::from_str("Missing 'id' field"))?);
    }
    Err(JsValue::from("What the hell :("))
}

