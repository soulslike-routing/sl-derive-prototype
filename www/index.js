import * as wasm from "sl-derive";

wasm.greet();


const obj0 = {
    user: {
        name: "userA",
        age: 30
    }
};

const obj1 = {
    user: {
        nested: {
            name: "nested",
            age: 30
        }
    }
};

console.log(wasm.process_nested_js_object(obj0, obj1)); // "User: Alice, Age: 30"
