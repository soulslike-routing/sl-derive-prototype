import * as wasm from "sl-derive";

function replacer(key, value) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

function reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

const spec = {};
const modelString = {/*Paste Model here to test!*/};

const model = JSON.parse(JSON.stringify(modelString), reviver);
const state = {};
const alreadyUpdatedState = {
    player: {
        position: {
            x: -52,
            y: -59,
            z: 55
        }
    }
}

console.log(wasm.derive(spec, model, state, alreadyUpdatedState));
