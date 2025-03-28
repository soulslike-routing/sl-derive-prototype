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

// Read a string from the instance's memory.
function readString(ptr, len, instance) {
    var m = new Uint8Array(instance.exports.memory.buffer, ptr, len);
    var decoder = new TextDecoder("utf-8");
    // return a slice of size `len` from the module's
    // memory, starting at offset `ptr`
    return decoder.decode(m.slice(0, len));
}

function deallocGuestMemory(ptr, len, instance) {
    // call the module's `dealloc` function
    instance.exports.dealloc(ptr, len);
}

// Invoke the `upper` function from the module
// and log the result to the console.
function upper(input1, input2, instance) {
    // transform the input string into its UTF-8
    // representation
    var bytes = new TextEncoder("utf-8").encode(input1);
    var bytes2 = new TextEncoder("utf-8").encode(input2);
    // copy the contents of the string into
    // the module's memory
    var ptr = copyMemory(bytes, instance);
    var ptr2 = copyMemory(bytes2, instance);
    // call the module's `upper` function and
    // get the offset into the memory where the
    // module wrote the result string
    var res_ptr = instance.exports.upper(ptr, bytes.length);
    var res_ptr2 = instance.exports.lower(ptr2, bytes2.length);
    // read the string from the module's memory,
    // store it, and log it to the console
    var result = readString(res_ptr, bytes.length, instance);
    console.log(result);
    var result2 = readString(res_ptr2, "AND THIS LOWER".length, instance);
    console.log(result2);
    // the JavaScript runtime took ownership of the
    // data returned by the module, which did not
    // deallocate it - so we need to clean it up
    deallocGuestMemory(res_ptr, bytes.length, instance);
    deallocGuestMemory(res_ptr2, "AND THIS LOWER".length, instance);
}


(async () => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const mod = new WebAssembly.Module(bytes);
    const instance = await WebAssembly.instantiate(mod, {});

    upper("this should be uppercase", "{\"message\": \"AND THIS LOWER\"}", instance);
})();