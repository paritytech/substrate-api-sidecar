
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
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
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

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
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_0.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * ### calc_partial_fee
 *
 * Tool to calculate an extrinsics' `partial_fee` (i.e. the total fee minus any tip).
 * It uses the following formula:
 *
 * ```
 * partial_fee = base_fee + len_fee + ((adjusted_weight_fee/estimated_weight)*actual_weight)
 * ```
 *
 * Where:
 * - `base_fee` is a fixed base fee to include some transaction in a block. It accounts
 *   for the work needed to verify the signature and the computing work common to any tx.
 *   It is constant for any tx.
 * - `len_fee` is a fee paid based on the size (length in bytes) of the transaction.
 *   Longer transactions require more storage, and therefore are more expensive.
 * - `adjusted_weight_fee` is a fee that is itself `estimated_weight * targeted_fee_adjustment`:
 *   - `targeted_fee_adjustment` is some adjustment made based on the network load and
 *     other circumstantial factors, and is an opaque internal value we have no access to.
 *   - `estimated_weight` is the "pre-dispatch" weight of the transaction. It's set
 *     based on the cost of processing the transaction on reference hardware.
 * - `actual_weight` is the weight that is found in the `ExtrinsicSuccess` event for
 *   the extrinsic in a block (it's just called `weight` in the event), and it's
 *   value is often close to `estimated_weight`, but the node has the opportunity
 *   to change it depending on the actual computing work necessary to process the tx.
 *
 * The RPC endpoint `payment_queryFeeDetails` returns `base_fee`, `len_fee` and
 * `adjusted_weight_fee`. The RPC endpoint `payment_queryInfo` returns `estimated_weight`
 * (called `weight` in the response), and a `partialFee` value, which is our best
 * guess at the inclusion fee for the tx without actually submitting it and seeing
 * whether the node changes the weight or decides not to take a fee at all.
 *
 * To get the correct values for some extrinsic from both endpoints, provide the
 * extrinsic bytes, and the number of the block **before the block it is included in**
 * (e.g. if the extrinsic was in block 100, you'd use block 99 as an argument). This
 * is very important.
 *
 * Once you've called these endpoints, access the `ExtrinsicSuccess` event to find
 * the `actual_weight`, but also a `paysFee` value which signals whether the extrinsic
 * actually incurred a fee at all or not (a node has the opportunity to refund the
 * fee entirely).
 *
 * With all of those values at hand, the equation above calculates the correct Fee.
 * Why? Well, the basic way to calculate a pre-dispatch fee is:
 *
 * ```
 * partial_fee = base_fee + len_fee + adjusted_weight_fee
 * ```
 *
 * We can do this from just the RPC methods. But then once it's in a block, we need
 * to swap out the weight used to calculate that `adjusted_weight_fee` with the
 * actual weight that was used from the `ExtrinsicSuccess` event. In the end, the
 * calculation itself is simple, but gathering the details needed is the main difficulty.
 * We do this all in Rust simply to limit any precision loss.
 * @param {string} base_fee
 * @param {string} len_fee
 * @param {string} adjusted_weight_fee
 * @param {string} estimated_weight
 * @param {string} actual_weight
 * @returns {string}
 */
module.exports.calc_partial_fee = function(base_fee, len_fee, adjusted_weight_fee, estimated_weight, actual_weight) {
    let deferred7_0;
    let deferred7_1;
    try {
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
        const ret = wasm.calc_partial_fee(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        var ptr6 = ret[0];
        var len6 = ret[1];
        if (ret[3]) {
            ptr6 = 0; len6 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred7_0 = ptr6;
        deferred7_1 = len6;
        return getStringFromWasm0(ptr6, len6);
    } finally {
        wasm.__wbindgen_free(deferred7_0, deferred7_1, 1);
    }
};

const CalcPayoutFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_calcpayout_free(ptr >>> 0, 1));

class CalcPayout {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CalcPayout.prototype);
        obj.__wbg_ptr = ptr;
        CalcPayoutFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CalcPayoutFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_calcpayout_free(ptr, 0);
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
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(nominator_exposure, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(total_exposure, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.calcpayout_calc_payout(this.__wbg_ptr, validator_reward_points, validator_commission, ptr0, len0, ptr1, len1, is_validator);
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
}
module.exports.CalcPayout = CalcPayout;

module.exports.__wbindgen_error_new = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

module.exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_export_0;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
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

wasm.__wbindgen_start();

