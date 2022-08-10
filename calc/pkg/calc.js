let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(String.raw`util`);

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
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

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
*/
class CalcPartialFee {

    static __wrap(ptr) {
        const obj = Object.create(CalcPartialFee.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_calcpartialfee_free(ptr);
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
    * @returns {CalcPartialFee}
    */
    static calc(base_fee, len_fee, adjusted_weight_fee, estimated_weight, actual_weight) {
        var ptr0 = passStringToWasm0(base_fee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(len_fee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(adjusted_weight_fee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = passStringToWasm0(estimated_weight, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = passStringToWasm0(actual_weight, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        var ret = wasm.calcpartialfee_calc(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        return CalcPartialFee.__wrap(ret);
    }
    /**
    * Return the calculated partial fee as a string, to avoid any precision
    * loss as it crosses the boundary back to JS land.
    * @returns {string}
    */
    partial_fee_as_string() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.calcpartialfee_partial_fee_as_string(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.CalcPartialFee = CalcPartialFee;
/**
*/
class CalcPayout {

    static __wrap(ptr) {
        const obj = Object.create(CalcPayout.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_calcpayout_free(ptr);
    }
    /**
    * @param {number} total_reward_points
    * @param {string} era_payout
    * @returns {CalcPayout}
    */
    static from_params(total_reward_points, era_payout) {
        var ptr0 = passStringToWasm0(era_payout, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.calcpayout_from_params(total_reward_points, ptr0, len0);
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
            var ptr0 = passStringToWasm0(nominator_exposure, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = passStringToWasm0(total_exposure, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
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

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'calc_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

