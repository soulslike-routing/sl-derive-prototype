use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use js_sys::Reflect;

mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, sl-derive!");
}

#[wasm_bindgen]
pub fn process_nested_js_object(obj0: &JsValue, obj1: &JsValue) -> Result<String, JsValue> {
    // Get the "user" object
    let user0 = Reflect::get(obj0, &JsValue::from_str("user"))?;

    // Extract "name" from user
    let name0 = Reflect::get(&user0, &JsValue::from_str("name"))?
        .as_string()
        .ok_or_else(|| JsValue::from_str("Missing 'name' field"))?;

    // Extract "age" from user
    let age0 = Reflect::get(&user0, &JsValue::from_str("age"))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str("Missing 'age' field"))?;

    // Get the "user" object
    let user1 = Reflect::get(obj1, &JsValue::from_str("user"))?;
    // Get the "nested" object
    let nested1 = Reflect::get(&user1, &JsValue::from_str("nested"))?;

    // Extract "name" from user
    let name1 = Reflect::get(&nested1, &JsValue::from_str("name"))?
        .as_string()
        .ok_or_else(|| JsValue::from_str("Missing 'name' field"))?;

    // Extract "age" from user
    let age1 = Reflect::get(&nested1, &JsValue::from_str("age"))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str("Missing 'age' field"))?;

    Ok(format!("User: {}, Age: {}, User: {}, Age: {}", name0, age0, name1, age1))
}

