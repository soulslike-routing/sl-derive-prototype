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

//console.log(wasm.derive(spec, model, state, alreadyUpdatedState));

const base64 = "";


function readStringWith4PrependedLengthBytes(ptr, instance) {
    var memory = new Uint8Array(instance.exports.memory.buffer);

    const view = new DataView(memory.buffer, ptr, 4);
    const length = view.getUint32(0, true); // true -> little-endian
    console.log(length);

    var decoder = new TextDecoder("utf-8");

    var str = decoder.decode(memory.subarray(ptr+4, ptr+4+length));
    return { string: str, bytes: length };
}

function jsObjectIntoWasmMemory(jsObject, instance) {
    const jsObjectAsString = JSON.stringify(jsObject);
    const jsObjectAsBytes = new TextEncoder("utf-8").encode(jsObjectAsString);
    let ptrToWasmMemory = instance.exports.alloc(jsObjectAsBytes.length);
    let memoryBuffer = new Uint8Array(instance.exports.memory.buffer, ptrToWasmMemory, jsObjectAsBytes.length);
    memoryBuffer.set(new Uint8Array(jsObjectAsBytes));
    return {ptr: ptrToWasmMemory, length: jsObjectAsBytes.length};
}

function call_wasm_derive(input1, input2, instance) {
    let input1Struct = jsObjectIntoWasmMemory(input1, instance);
    let input2Struct = jsObjectIntoWasmMemory(input2, instance);

    // Actually call into wasm derive
    let pointerToResultStruct = instance.exports.derive_wrapper(
        input1Struct.ptr,
        input1Struct.length,
        input2Struct.ptr,
        input2Struct.length
    );

    const resultStruct = readStringWith4PrependedLengthBytes(pointerToResultStruct, instance);
    instance.exports.dealloc(pointerToResultStruct, 4 + resultStruct.bytes);
    return resultStruct.string;
}

async function wasm_instance_from_b64_string(b64wasm) {
    const binaryString = atob(b64wasm);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const mod = new WebAssembly.Module(bytes);
    return await WebAssembly.instantiate(mod, {});
}

(async () => {
    let wasm_instance = await wasm_instance_from_b64_string(base64);
    let obj1 = {message: "THIS IS VERY LONG"}
    let obj2 = {message: "AND THIS SHORT"}
    const deriveString = call_wasm_derive(obj1, obj2, wasm_instance);
    console.log(deriveString);
})();