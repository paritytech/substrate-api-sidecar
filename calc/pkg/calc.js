let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
/**
* Uses the following formula to calculate an extrinsics `partial_fee` (ie the total fee
* minus any tip).
*
* ```
* partial_fee = base_fee + len_fee + ((adjusted_weight_fee/estimated_weight)*actual_weight)
* ```
*
* Where:
* - `base_fee` is a fixed base fee to include some transaction in a block. It accounts
*   for the work needed to verify the signature and such and is constant for any tx.
* - `len_fee` is a fee paid based on the size (length in bytes) of the transaction. Longer
*   transactions require more storage.
* - `adjusted_weight_fee` is a fee that is itself `estimated_weight * targeted_fee_adjustment`.
*   `targeted_fee_adjustment` is some adjustment made based on the network load and such, and is
*   an opaque internal value we have no access to.
* - `estimated_weight` is the "pre-dispatch" weight of the transaction. It's set based on the cost
*   of processing the transaction on reference hardware.
* - `actual_weight` is the weight that is found in the `ExtrinsicSuccess` event for the extrinsic in
*   a block (it's just called `weight` in the event), and is often the same as `estimated_weight`,
*   but the node has the opportunity to change it to whatever it likes, I think.
*
* The RPC endpoint `payment_queryFeeDetails` returns `base_fee`, `len_fee` and `adjusted_weight_fee`/
* The RPC endpoint `payment_queryInfo` returns `estimated_weight` (called `weight` in the response), and
* a `partialFee` value, which is our best guess at the inclusion fee for the tx without actually submitting
* it and seeing whether the node changes the weight/decides not to take a fee at all.
*
* To get the correct values for some extrinsic from both endpoints, provide the extrinsic bytes, and the
* block number **one before the block it made it into** (eg if the extrinsic was in block 100, you'd use
* block 99 as an argument). This is very important.
*
* Once you've called these endpoints, access the `ExtrinsicSuccess` event to find the `actual_weight`, but
* also a `paysFee` value which signals whether the extrinsic actually incurred a fee at all or not (a node
* has the opportunity to refund the fee entirely if it likes by setting this).
*
* With all of those values to hand, the equation above calculates the correct Fee. Why? Well, the basic
* way to calculate a pre-dispatch fee is:
*
* ```
* partial_fee = base_fee + len_fee + adjusted_weight_fee
* ```
*
* We can do this from just the RPC methods. But then once it's in a block, we need to swap out the weight used
* to calculate that `adjusted_weight_fee` with the actual weight that was used from the `ExtrinsicSuccess` event.
* In the end, the maths is simple and gathering the details needed is the main difficulty. We do this all in
* Rust simply to limit any precision loss.
* @param {string} base_fee
* @param {string} len_fee
* @param {string} adjusted_weight_fee
* @param {string} estimated_weight
* @param {string} actual_weight
* @returns {string}
*/
module.exports.calc_partial_fee = function(base_fee, len_fee, adjusted_weight_fee, estimated_weight, actual_weight) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(base_fee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(len_fee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(adjusted_weight_fee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(estimated_weight, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(actual_weight, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        wasm.calc_partial_fee(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr5 = r0;
        var len5 = r1;
        if (r3) {
            ptr5 = 0; len5 = 0;
            throw takeObject(r2);
        }
        return getStringFromWasm0(ptr5, len5);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(ptr5, len5);
    }
};

/**
*/
class CalcPayout {

    static __wrap(ptr) {
        const obj = Object.create(CalcPayout.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_calcpayout_free(ptr);
    }
    /**
    * @param {number} total_reward_points
    * @param {string} era_payout
    * @returns {CalcPayout}
    */
    static from_params(total_reward_points, era_payout) {
        const ptr0 = passStringToWasm0(era_payout, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.calcpayout_from_params(total_reward_points, ptr0, len0);
        return CalcPayout.__wrap(ret);
    }
    /**
    * @param {number} validator_reward_points
    * @param {number} validator_commission
    * @param {string} nominator_exposure
    * @param {string} total_exposure
    * @param {boolean} is_validator
    * @returns {string}
    */
    calc_payout(validator_reward_points, validator_commission, nominator_exposure, total_exposure, is_validator) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(nominator_exposure, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(total_exposure, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.calcpayout_calc_payout(retptr, this.ptr, validator_reward_points, validator_commission, ptr0, len0, ptr1, len1, is_validator);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.CalcPayout = CalcPayout;

module.exports.__wbindgen_error_new = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'calc_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

