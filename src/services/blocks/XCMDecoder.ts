// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import type { ApiPromise } from '@polkadot/api';
import type { Bytes } from '@polkadot/types';

import type {
	IDownwardMessage,
	IExtrinsic,
	IFrameMethod,
	IHorizontalMessage,
	IMessages,
	IUpwardMessage,
} from '../../types/responses';
import type { ISanitizedBackedCandidate } from '../../types/responses/SanitizedBackedCandidate';
import type { ISanitizedParachainInherentData } from '../../types/responses/SanitizedParachainInherentData';
import type { ISanitizedParentInherentData } from '../../types/responses/SanitizedParentInherentData';

enum ChainType {
	Relay = 'Relay',
	Parachain = 'Parachain',
}

export class XcmDecoder {
	readonly messages: IMessages;
	readonly api: ApiPromise;
	readonly curChainType: ChainType;
	readonly specName: string;

	constructor(api: ApiPromise, specName: string, extrinsics: IExtrinsic[], paraId?: number) {
		this.api = api;
		this.specName = specName;
		this.curChainType = this.getCurChainType(specName);
		this.messages = this.getMessages(api, extrinsics, paraId);
	}

	private getCurChainType(specName: string): ChainType {
		const relay = ['polkadot', 'kusama', 'westend', 'rococo'];
		if (relay.includes(specName.toLowerCase())) {
			return ChainType.Relay;
		} else {
			return ChainType.Parachain;
		}
	}

	private getMessages(api: ApiPromise, extrinsics: IExtrinsic[], paraId?: number): IMessages {
		const xcmMessages: IMessages = { horizontalMessages: [], downwardMessages: [], upwardMessages: [] };
		if (this.curChainType === ChainType.Relay) {
			extrinsics.forEach((extrinsic) => {
				const frame = extrinsic.method as IFrameMethod;
				if (frame.pallet === 'paraInherent' && frame.method === 'enter') {
					const data = extrinsic.args.data as ISanitizedParentInherentData;
					if (paraId !== undefined) {
						data.backedCandidates.forEach((candidate) => {
							if (candidate.candidate.descriptor.paraId.toString() === paraId.toString()) {
								const msg_decoded = this.checkUpwardMsg(api, candidate);
								if (msg_decoded != undefined && Object.keys(msg_decoded).length > 0) {
									xcmMessages.upwardMessages?.push(msg_decoded);
								}
							}
						});
					} else {
						data.backedCandidates.forEach((candidate) => {
							const msg_decoded = this.checkUpwardMsg(api, candidate);
							if (msg_decoded != undefined && Object.keys(msg_decoded).length > 0) {
								xcmMessages.upwardMessages?.push(msg_decoded);
							}
						});
					}
				}
			});
		} else if (this.curChainType === ChainType.Parachain) {
			extrinsics.forEach((extrinsic) => {
				const frame: IFrameMethod = extrinsic.method as IFrameMethod;
				if (frame.pallet === 'parachainSystem' && frame.method === 'setValidationData') {
					const data = extrinsic.args.data as ISanitizedParachainInherentData;
					data.downwardMessages.forEach((msg) => {
						const message = msg.msg;
						if (message && message.toString().length > 0) {
							const xcmMessageDecoded = this.decodeMsg(api, message);
							const downwardMessage: IDownwardMessage = {
								sentAt: msg.sentAt,
								msg: message.toString(),
								data: xcmMessageDecoded,
							};
							xcmMessages.downwardMessages?.push(downwardMessage);
						}
					});
					data.horizontalMessages.forEach((msgs, index) => {
						msgs.forEach((msg) => {
							const xcmMessageDecoded = this.decodeMsg(api, msg.data.slice(1));
							let horizontalMessage: IHorizontalMessage;
							if (paraId !== undefined && index.toString() === paraId.toString()) {
								horizontalMessage = {
									sentAt: msg.sentAt,
									paraId: index,
									data: xcmMessageDecoded,
								};
								xcmMessages.horizontalMessages?.push(horizontalMessage);
							} else if (paraId === undefined) {
								horizontalMessage = {
									sentAt: msg.sentAt,
									paraId: index,
									data: xcmMessageDecoded,
								};
								xcmMessages.horizontalMessages?.push(horizontalMessage);
							}
						});
					});
				}
			});
		}
		return xcmMessages;
	}

	private checkUpwardMsg(api: ApiPromise, candidate: ISanitizedBackedCandidate): IUpwardMessage | undefined {
		if (candidate.candidate.commitments.upwardMessages.length > 0) {
			const xcmMessage = candidate.candidate.commitments.upwardMessages;
			const paraId: string = candidate.candidate.descriptor.paraId;
			const xcmMessageDecoded: string = this.decodeMsg(api, xcmMessage[0]);
			const upwardMessage = {
				paraId: paraId,
				data: xcmMessageDecoded[0],
			};
			return upwardMessage;
		} else {
			return undefined;
		}
	}

	private decodeMsg(api: ApiPromise, message: string): string {
		const instructions = [];
		let xcmMessage: string = message;
		let instructionLength = 0;
		while (xcmMessage.length != 0) {
			const xcmInstructions: Bytes = api.createType('XcmVersionedXcm', xcmMessage);
			instructions.push(xcmInstructions);
			instructionLength = xcmInstructions.toU8a().length;
			xcmMessage = xcmMessage.slice(instructionLength);
		}
		return instructions as unknown as string;
	}
}
