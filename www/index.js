import * as wasm from "sl-derive";

wasm.greet();


const obj = {
    user: {
        name: "testing",
        age: 30
    }
};

console.log(wasm.process_nested_js_object(obj)); // "User: Alice, Age: 30"
