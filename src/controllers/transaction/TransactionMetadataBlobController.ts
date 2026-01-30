// Copyright 2017-2026 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { TransactionMetadataBlobService } from '../../services';
import { IMetadataBlobBody, IPostRequestHandler } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * Parameters for generating metadata blob proof.
 */
export interface MetadataBlobParams {
	/**
	 * Full encoded extrinsic. Use this OR the individual parts.
	 */
	tx?: string;
	/**
	 * Optional tx additional signed data.
	 */
	txAdditionalSigned?: string;
	/**
	 * Call data. Use with includedInExtrinsic and includedInSignedData.
	 */
	callData?: string;
	/**
	 * Signed Extension data included in the extrinsic.
	 */
	includedInExtrinsic?: string;
	/**
	 * Signed Extension data included in the signature.
	 */
	includedInSignedData?: string;
}

/**
 * POST metadata blob for a transaction.
 *
 * This endpoint generates the minimal metadata ("metadata blob" or "proof")
 * needed by offline signers to decode a transaction's signing payload.
 * It also returns the metadata hash that should be used with the
 * CheckMetadataHash signed extension per RFC-0078.
 *
 * Request body:
 * - Alternative 1: Full extrinsic
 *   - `tx`: Hex-encoded full extrinsic
 *   - `txAdditionalSigned`: (Optional) Hex-encoded additional signed data
 *
 * - Alternative 2: Extrinsic parts
 *   - `callData`: Hex-encoded call data
 *   - `includedInExtrinsic`: Hex-encoded signed extension extra data
 *   - `includedInSignedData`: Hex-encoded signed extension additional signed data
 *
 * - `at`: (Optional) Block hash or number. Defaults to finalized head.
 *
 * Returns:
 * - `at`: Block context (hash and height)
 * - `metadataHash`: The 32-byte metadata hash for CheckMetadataHash as hex
 * - `metadataBlob`: The minimal metadata proof for offline signers as hex
 * - `specVersion`: Runtime spec version
 * - `specName`: Runtime spec name
 * - `base58Prefix`: SS58 address prefix
 * - `decimals`: Native token decimals
 * - `tokenSymbol`: Native token symbol
 *
 * The `metadataBlob` contains:
 * - Type definitions needed to decode the specific transaction
 * - Merkle proofs verifying these types are part of the full metadata
 * - Extra info (specVersion, specName, base58Prefix, decimals, tokenSymbol)
 *
 * Offline signers can use this to:
 * 1. Decode the transaction to display what the user is signing
 * 2. Verify the metadata subset matches the on-chain metadata via merkle proofs
 *
 * Reference:
 * - RFC-0078: https://polkadot-fellows.github.io/RFCs/approved/0078-merkleized-metadata.html
 * - Original issue: https://github.com/paritytech/substrate-api-sidecar/issues/1783
 */
export default class TransactionMetadataBlobController extends AbstractController<TransactionMetadataBlobService> {
	static controllerName = 'TransactionMetadataBlob';
	static requiredPallets = [];

	constructor(api: string) {
		super(api, '/transaction/metadata-blob', new TransactionMetadataBlobService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.post(this.path, TransactionMetadataBlobController.catchWrap(this.getMetadataBlob));
	}

	/**
	 * POST handler for generating metadata blob.
	 */
	private getMetadataBlob: IPostRequestHandler<IMetadataBlobBody> = async (
		{ body: { tx, txAdditionalSigned, callData, includedInExtrinsic, includedInSignedData, at } },
		res,
	): Promise<void> => {
		const hash = await this.getHashFromAt(at);

		TransactionMetadataBlobController.sanitizedSend(
			res,
			await this.service.fetchMetadataBlob(this.api, hash, {
				tx,
				txAdditionalSigned,
				callData,
				includedInExtrinsic,
				includedInSignedData,
			}),
		);
	};
}
