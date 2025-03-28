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

// Copy `data` into the `instance` exported memory buffer.
function copyMemory(data, instance) {
    // the `alloc` function returns an offset in
    // the module's memory to the start of the block
    var ptr = instance.exports.alloc(data.length);
    // create a typed `ArrayBuffer` at `ptr` of proper size
    var mem = new Uint8Array(instance.exports.memory.buffer, ptr, data.length);
    // copy the content of `data` into the memory buffer
    mem.set(new Uint8Array(data));
    // return the pointer
    return ptr;
}

function readStringWith4PrependedLenghtBytes(ptr, instance) {
    var memory = new Uint8Array(instance.exports.memory.buffer);

    const view = new DataView(memory.buffer, ptr, 4);
    const length = view.getUint32(0, true); // true -> little-endian
    console.log(length);

    var decoder = new TextDecoder("utf-8");

    var str = decoder.decode(memory.subarray(ptr+4, ptr+4+length));
    return { string: str, bytes: length };
}


function deallocGuestMemory(ptr, len, instance) {
    // call the module's `dealloc` function
    instance.exports.dealloc(ptr, len);
}

function shorter(input1, input2, instance) {
    var bytes = new TextEncoder("utf-8").encode(input1);
    var bytes2 = new TextEncoder("utf-8").encode(input2);

    var ptr = copyMemory(bytes, instance);
    var ptr2 = copyMemory(bytes2, instance);

    var res_ptr = instance.exports.derive_wrapper(ptr, ptr2, bytes.length, bytes2.length);
    // ptr2 is invalid from here on out

    var result = readStringWith4PrependedLenghtBytes(res_ptr, instance);
    console.log(result.string);

    // the JavaScript runtime took ownership of the
    // data returned by the module, which did not
    // deallocate it - so we need to clean it upngth, instance);
    // but the original data should have gotten cleaned up already

    deallocGuestMemory(res_ptr, 4 + result.bytes, instance);
}


(async () => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const mod = new WebAssembly.Module(bytes);
    const instance = await WebAssembly.instantiate(mod, {});

    shorter("{\"message\": \"THIS IS VERY LONG\"}", "{\"message\": \"AND THIS SHORT\"}", instance);
})();