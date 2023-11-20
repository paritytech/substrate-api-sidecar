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

export const metadataFlipper = {
	source: {
		hash: '0xb70bb55cde6ba9a0c26f591b1f17268d60a28bce7ff5f1b108cf507075aded14',
		language: 'ink! 3.3.1',
		compiler: 'rustc 1.64.0-nightly',
	},
	contract: {
		name: 'flipper',
		version: '0.1.0',
		authors: ['[your_name] <[your_email]>'],
	},
	V3: {
		spec: {
			constructors: [
				{
					args: [
						{
							label: 'init_value',
							type: {
								displayName: ['bool'],
								type: 0,
							},
						},
					],
					docs: ['Constructor that initializes the `bool` value to the given `init_value`.'],
					label: 'new',
					payable: false,
					selector: '0x9bae9d5e',
				},
				{
					args: [],
					docs: [
						'Constructor that initializes the `bool` value to `false`.',
						'',
						'Constructors can delegate to other constructors.',
					],
					label: 'default',
					payable: false,
					selector: '0xed4b9d1b',
				},
			],
			docs: [],
			events: [],
			messages: [
				{
					args: [],
					docs: [
						' A message that can be called on instantiated contracts.',
						' This one flips the value of the stored `bool` from `true`',
						' to `false` and vice versa.',
					],
					label: 'flip',
					mutates: true,
					payable: false,
					returnType: null,
					selector: '0x633aa551',
				},
				{
					args: [],
					docs: [' Simply returns the current value of our `bool`.'],
					label: 'get',
					mutates: false,
					payable: false,
					returnType: {
						displayName: ['bool'],
						type: 0,
					},
					selector: '0x2f865bd9',
				},
			],
		},
		storage: {
			struct: {
				fields: [
					{
						layout: {
							cell: {
								key: '0x0000000000000000000000000000000000000000000000000000000000000000',
								ty: 0,
							},
						},
						name: 'value',
					},
				],
			},
		},
		types: [
			{
				id: 0,
				type: {
					def: {
						primitive: 'bool',
					},
				},
			},
		],
	},
};
