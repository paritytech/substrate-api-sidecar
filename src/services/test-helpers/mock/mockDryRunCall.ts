export const mockDryRunCallResult = {
	Ok: {
		executionResult: {
			Ok: {
				actualWeight: null,
				paysFee: 'Yes',
			},
		},
		emittedEvents: [
			{
				method: 'Burned',
				section: 'balances',
				index: '0x0a0b',
				data: {
					who: '5EJWF8s4CEoRU8nDhHBYTT6QGFGqMXTmdQdaQJVEFNrG9sKy',
					amount: 1,
				},
			},
			{
				method: 'Issued',
				section: 'balances',
				index: '0x0a0f',
				data: {
					amount: 0,
				},
			},
			{
				method: 'Attempted',
				section: 'polkadotXcm',
				index: '0x1f00',
				data: {
					outcome: {
						Complete: {
							used: {
								refTime: '182,042,000',
								proofSize: '3,593',
							},
						},
					},
				},
			},
			{
				method: 'Burned',
				section: 'balances',
				index: '0x0a0b',
				data: {
					who: '5EJWF8s4CEoRU8nDhHBYTT6QGFGqMXTmdQdaQJVEFNrG9sKy',
					amount: '30,870,000,000',
				},
			},
			{
				method: 'Minted',
				section: 'balances',
				index: '0x0a0a',
				data: {
					who: '5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z',
					amount: '30,870,000,000',
				},
			},
			{
				method: 'FeesPaid',
				section: 'polkadotXcm',
				index: '0x1f15',
				data: {
					paying: {
						parents: 0,
						interior: {
							X1: [
								{
									AccountId32: {
										network: 'Westend',
										id: '0x62fecf9c60d8d49d400bd86804558401ec7151fecd440041ca6bf5fd57825177',
									},
								},
							],
						},
					},
					fees: [
						{
							id: {
								parents: 1,
								interior: 'Here',
							},
							fun: {
								Fungible: '30,870,000,000',
							},
						},
					],
				},
			},
			{
				method: 'UpwardMessageSent',
				section: 'parachainSystem',
				index: ' 0x0105',
				data: {
					messageHash: '0x10837cd56154e02f55910ce1f49dffd5d664bb69ddea6782d714c804611afa08',
				},
			},
			{
				method: 'Sent',
				section: 'polkadotXcm',
				index: '0x1f01',
				data: {
					origin: {
						parents: 0,
						interior: {
							X1: [
								{
									AccountId32: {
										network: 'Westend',
										id: '0x62fecf9c60d8d49d400bd86804558401ec7151fecd440041ca6bf5fd57825177',
									},
								},
							],
						},
					},
					destination: {
						parents: 1,
						interior: 'Here',
					},
					message: [
						{
							ReceiveTeleportedAsset: [
								{
									id: {
										parents: 0,
										interior: 'Here',
									},
									fun: {
										Fungible: 1,
									},
								},
							],
						},
						'ClearOrigin',
						{
							BuyExecution: {
								fees: {
									id: {
										parents: 0,
										interior: 'Here',
									},
									fun: {
										Fungible: 1,
									},
								},
								weightLimit: 'Unlimited',
							},
						},
						{
							DepositAsset: {
								assets: {
									Wild: {
										AllCounted: 1,
									},
								},
								beneficiary: {
									parents: 0,
									interior: {
										X1: [
											{
												AccountId32: {
													network: null,
													id: '0x7369626c27080000000000000000000000000000000000000000000000000000',
												},
											},
										],
									},
								},
							},
						},
					],
					messageId: '0x0a5e3678f8746990e65680ed6a463597f1e02e2c00802bf2eeef82368c4f6233',
				},
			},
		],
		localXcm: {
			V4: [
				{
					WithdrawAsset: [
						{
							id: {
								parents: 1,
								interior: 'Here',
							},
							fun: {
								Fungible: 1,
							},
						},
					],
				},
				{
					BurnAsset: [
						{
							id: {
								parents: 1,
								interior: 'Here',
							},
							fun: {
								Fungible: 1,
							},
						},
					],
				},
			],
		},
		forwardedXcms: [
			[
				{
					V4: {
						parents: 1,
						interior: 'Here',
					},
				},
				[
					{
						V4: [
							{
								ReceiveTeleportedAsset: [
									{
										id: {
											parents: 0,
											interior: 'Here',
										},
										fun: {
											Fungible: 1,
										},
									},
								],
							},
							'ClearOrigin',
							{
								BuyExecution: {
									fees: {
										id: {
											parents: 0,
											interior: 'Here',
										},
										fun: {
											Fungible: 1,
										},
									},
									weightLimit: 'Unlimited',
								},
							},
							{
								DepositAsset: {
									assets: {
										Wild: {
											AllCounted: 1,
										},
									},
									beneficiary: {
										parents: 0,
										interior: {
											X1: [
												{
													AccountId32: {
														network: null,
														id: '0x7369626c27080000000000000000000000000000000000000000000000000000',
													},
												},
											],
										},
									},
								},
							},
							{
								SetTopic: '0x0a5e3678f8746990e65680ed6a463597f1e02e2c00802bf2eeef82368c4f6233',
							},
						],
					},
				],
			],
		],
	},
};
