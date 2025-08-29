const { decodeAddress, blake2AsU8a, blake2AsHex, keccakAsU8a, encodeAddress } = require("@polkadot/util-crypto");
const {u8aToHex, u8aConcat} = require("@polkadot/util");
const Buffer = require("buffer").Buffer;
const  {  H160 } = require('@polkadot/types/interfaces');

function convertH160ToSs58(h160Addr) {
  const addressBytes = Buffer.from(h160Addr.slice(2), 'hex');
  const prefixBytes = Buffer.from('evm:');
  const convertBytes = Uint8Array.from(Buffer.concat([ prefixBytes, addressBytes ]));
  const finalAddressHex = blake2AsHex(convertBytes, 256);
  return encodeAddress(finalAddressHex);
}

function getPubKey(ss58addr) {
  return '0x' + Buffer.from(decodeAddress(ss58addr)).toString('hex');
}

function convertSs58ToH160(ss58Addr) {

  const pubKey = getPubKey(ss58Addr);
  console.log('Public Key:', pubKey);
  return pubKey.slice(0, 42);
}

function main() {
    const address = '5GvmgeGTbYrL2wyCM5ZzJHtvfcHLuPS33p43cPb6s3CMCYiQ'
    const accountId32 = '167vSUfcfk6DPmFNbV5MJZUbacSgxNYs85YUmBhgXAFHj3fd';
    const accountId20 = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';

    console.log('Account ID 32:', accountId32);
    console.log('Account ID 20:', accountId20);

    console.log('H160 from accountId20:', H160.from(accountId20));
    console.log('H160 from accountId32:', H160.from(accountId32));
    // try {
    //     const decodedToEVM = u8aToHex(decodeAddress(address).subarray(0,20));
    //     console.log('Decoded Hex:', decodedToEVM);
    //     console.log('Decoded to Hex using convertSs58ToH160:', convertSs58ToH160(address));

    //     const hasher = (hashType, address) => {
    //         if (hashType === 'blake2') {
    //             return blake2AsU8a(address, 256);
    //         } else if (hashType === 'keccak') {
    //             return keccakAsU8a(address, 256);
    //         }
    //         throw new Error('Unsupported hash type');
    //     }

    //     const message = u8aConcat('evm:', decodedToEVM);
    //     console.log('roundtrip SS58', encodeAddress(hasher('blake2', message), 42));
    //     console.log('roundtrip SS58 using convertH160ToSs58', convertH160ToSs58(decodedToEVM));
    //     console.log('roundtrip SS58 using convertH160ToSs58 with address:', convertSs58ToH160(convertH160ToSs58(decodedToEVM)));
    // } catch (error) {
    //     console.error('Error decoding address:', error);
    // }
}

main();