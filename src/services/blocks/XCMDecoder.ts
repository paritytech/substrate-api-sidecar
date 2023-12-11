// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import '@polkadot/api-augment';

import { ApiPromise } from '@polkadot/api';
import { Bytes } from '@polkadot/types';
import { ISanitizedBackedCandidate } from 'src/types/responses/SanitizedBackedCandidate';
import { ISanitizedParachainInherentData } from 'src/types/responses/SanitizedParachainInherentData';
import { ISanitizedParentInherentData } from 'src/types/responses/SanitizedParentInherentData';

import {
	IDownwardMessage,
	IExtrinsic,
	IFrameMethod,
	IHorizontalMessage,
	IMessages,
	IUpwardMessage,
} from '../../types/responses';

enum ChainType {
	Relay = 'Relay',
	Parachain = 'Parachain',
}

export class XcmDecoder {
	readonly messages: IMessages[];
	readonly api: ApiPromise;
	static curChainType: ChainType;

	constructor(api: ApiPromise, specName: string, extrinsics: IExtrinsic[], paraId?: string) {
		this.api = api;
		XcmDecoder.curChainType = XcmDecoder.getCurChainType(specName);
		this.messages = XcmDecoder.getMessages(api, extrinsics, paraId);
	}

	static getCurChainType(specName: string): ChainType {
		const relay = ['polkadot', 'kusama', 'westend', 'rococo'];
		if (relay.includes(specName)) {
			return ChainType.Relay;
		} else {
			return ChainType.Parachain;
		}
	}

	static getMessages(api: ApiPromise, extrinsics: IExtrinsic[], paraId?: string): IMessages[] {
		const xcmMessages: IMessages[] = [];
		if (XcmDecoder.curChainType === ChainType.Relay) {
			extrinsics.forEach((extrinsic) => {
				const frame = extrinsic.method as IFrameMethod;
				if (frame.pallet === 'paraInherent' && frame.method === 'enter') {
					const data = extrinsic.args.data as ISanitizedParentInherentData;
					const upwardMessage: IUpwardMessage[] = [];
					if (paraId !== undefined) {
						data.backedCandidates.forEach((candidate) => {
							if (candidate.candidate.descriptor.paraId.toString() === paraId) {
								const msg_decoded = XcmDecoder.checkUpwardMsg(api, candidate);
								if (msg_decoded != undefined && Object.keys(msg_decoded).length > 0) {
									upwardMessage.push(msg_decoded);
								}
							}
						});
					} else {
						data.backedCandidates.forEach((candidate) => {
							const msg_decoded = XcmDecoder.checkUpwardMsg(api, candidate);
							if (msg_decoded != undefined && Object.keys(msg_decoded).length > 0) {
								upwardMessage.push(msg_decoded);
							}
						});
					}
					xcmMessages.push({
						upwardMessages: upwardMessage,
					});
				}
			});
		} else if (XcmDecoder.curChainType === ChainType.Parachain) {
			extrinsics.forEach((extrinsic) => {
				const frame: IFrameMethod = extrinsic.method as IFrameMethod;
				if (frame.pallet === 'parachainSystem' && frame.method === 'setValidationData') {
					const data = extrinsic.args.data as ISanitizedParachainInherentData;
					data.downwardMessages.forEach((msg) => {
						const message = msg.msg;
						if (message && message.toString().length > 0) {
							const downwardMessage: IDownwardMessage[] = [];
							const xcmMessageDecoded = this.decodeMsg(api, message);
							downwardMessage.push({
								sentAt: msg.sentAt,
								msg: message.toString(),
								data: xcmMessageDecoded,
							});
							xcmMessages.push({
								downwardMessages: downwardMessage,
							});
						}
					});
					data.horizontalMessages.forEach((msgs, index) => {
						msgs.forEach((msg) => {
							const horizontalMessage: IHorizontalMessage[] = [];
							const xcmMessageDecoded = this.decodeMsg(api, msg.data.slice(1));
							if (paraId !== undefined && index.toString() === paraId) {
								horizontalMessage.push({
									sentAt: msg.sentAt,
									paraId: index,
									data: xcmMessageDecoded,
								});
								xcmMessages.push({
									horizontalMessages: horizontalMessage,
								});
							} else if (paraId === undefined) {
								horizontalMessage.push({
									sentAt: msg.sentAt,
									paraId: index,
									data: xcmMessageDecoded,
								});
								xcmMessages.push({
									horizontalMessages: horizontalMessage,
								});
							}
						});
					});
				}
			});
		}
		return xcmMessages;
	}

	static checkUpwardMsg(api: ApiPromise, candidate: ISanitizedBackedCandidate): IUpwardMessage | undefined {
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

	static decodeMsg(api: ApiPromise, message: string): string {
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
