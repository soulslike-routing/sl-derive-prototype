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
pub fn process_nested_js_object(obj: &JsValue) -> Result<String, JsValue> {
    // Get the "user" object
    let user = Reflect::get(obj, &JsValue::from_str("user"))?;

    // Extract "name" from user
    let name = Reflect::get(&user, &JsValue::from_str("name"))?
        .as_string()
        .ok_or_else(|| JsValue::from_str("Missing 'name' field"))?;

    // Extract "age" from user
    let age = Reflect::get(&user, &JsValue::from_str("age"))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str("Missing 'age' field"))?;

    Ok(format!("User: {}, Age: {}", name, age))
}

