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
import type { ISanitizedBackedCandidateHorizontalMessage } from '../../types/responses/SanitizedBackedCandidatesHorizontalMessage';
import type { ISanitizedParachainInherentData } from '../../types/responses/SanitizedParachainInherentData';
import type { ISanitizedParentInherentData } from '../../types/responses/SanitizedParentInherentData';
import { IOption } from '../../types/util';

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
					data.backedCandidates.forEach((candidate) => {
						if (paraId === undefined || candidate.candidate.descriptor.paraId.toString() === paraId.toString()) {
							const horizontalMsgs: IHorizontalMessage[] = this.checkMessagesInRelay(
								api,
								candidate,
								'horizontal',
								paraId,
							) as IHorizontalMessage[];
							if (horizontalMsgs != null && horizontalMsgs.length > 0) {
								horizontalMsgs.forEach((msg: IHorizontalMessage) => {
									xcmMessages.horizontalMessages?.push(msg);
								});
							}

							const upwardMsgs = this.checkMessagesInRelay(api, candidate, 'upward', paraId);
							if (upwardMsgs != null && upwardMsgs.length > 0) {
								upwardMsgs.forEach((msg: IUpwardMessage) => {
									xcmMessages.upwardMessages?.push(msg);
								});
							}
						}
					});
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
						if (paraId === undefined || index.toString() === paraId.toString()) {
							msgs.forEach((msg) => {
								const xcmMessageDecoded = this.decodeMsg(api, msg.data.slice(1));
								const horizontalMessage: IHorizontalMessage = {
									sentAt: msg.sentAt,
									paraId: index,
									data: xcmMessageDecoded,
								};
								xcmMessages.horizontalMessages?.push(horizontalMessage);
							});
						}
					});
				}
			});
		}
		return xcmMessages;
	}

	private checkMessagesInRelay(
		api: ApiPromise,
		candidate: ISanitizedBackedCandidate,
		messageType: 'upward' | 'horizontal',
		paraId?: number,
	): IOption<IUpwardMessage[] | IHorizontalMessage[]> {
		const messages: IUpwardMessage[] | IHorizontalMessage[] = [];
		const xcmMessages =
			messageType === 'upward'
				? candidate.candidate.commitments.upwardMessages
				: candidate.candidate.commitments.horizontalMessages;

		if (xcmMessages.length > 0) {
			const paraIdCandidate: string = candidate.candidate.descriptor.paraId.toString();

			xcmMessages.forEach((msg: string | ISanitizedBackedCandidateHorizontalMessage) => {
				const msgData: string =
					messageType === 'upward'
						? (msg as string)
						: (msg as ISanitizedBackedCandidateHorizontalMessage).data.slice(1);
				const xcmMessageDecoded: string = this.decodeMsg(api, msgData);

				if (paraId === undefined || paraIdCandidate === paraId.toString()) {
					if (messageType === 'upward') {
						const upwardMessage: IUpwardMessage = {
							paraId: paraIdCandidate,
							data: xcmMessageDecoded,
						};
						(messages as IUpwardMessage[]).push(upwardMessage);
					} else {
						const horizontalMessage: IHorizontalMessage = {
							sentAt: (msg as ISanitizedBackedCandidateHorizontalMessage).recipient.toString(),
							paraId: paraIdCandidate,
							data: xcmMessageDecoded,
						};
						(messages as IHorizontalMessage[]).push(horizontalMessage);
					}
				}
			});

			return messages;
		} else {
			return null;
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
