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


function readStringWith4PrependedLenghtBytes(ptr, instance) {
    var memory = new Uint8Array(instance.exports.memory.buffer);

    const view = new DataView(memory.buffer, ptr, 4);
    const length = view.getUint32(0, true); // true -> little-endian
    console.log(length);

    var decoder = new TextDecoder("utf-8");

    var str = decoder.decode(memory.subarray(ptr+4, ptr+4+length));
    return { string: str, bytes: length };
}


function call_wasm_derive(input1, input2, instance) {
    const input1AsString = JSON.stringify(input1);
    var input1AsBytes = new TextEncoder("utf-8").encode(input1AsString);
    let ptrToInput1WasmMemory = instance.exports.alloc(input1AsBytes.length);
    let memoryBuffer1 = new Uint8Array(instance.exports.memory.buffer, ptrToInput1WasmMemory, input1AsBytes.length);
    memoryBuffer1.set(new Uint8Array(input1AsBytes));

    const input2AsString = JSON.stringify(input2);
    var input2AsBytes = new TextEncoder("utf-8").encode(input2AsString);
    let ptrToInput2WasmMemory = instance.exports.alloc(input2AsBytes.length);
    let memoryBuffer2 = new Uint8Array(instance.exports.memory.buffer, ptrToInput2WasmMemory, input2AsBytes.length);
    memoryBuffer2.set(new Uint8Array(input2AsBytes));

    // Actually call into wasm derive
    let pointerToResultStruct = instance.exports.derive_wrapper(
        ptrToInput1WasmMemory,
        ptrToInput2WasmMemory,
        input1AsBytes.length,
        input2AsBytes.length
    );

    const resultStruct = readStringWith4PrependedLenghtBytes(pointerToResultStruct, instance);
    instance.exports.dealloc(pointerToResultStruct, 4 + resultStruct.bytes);
    return resultStruct.string;
}

async function wasm_instance_from_b64_string(b64wasm) {
    const binaryString = atob(base64);
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