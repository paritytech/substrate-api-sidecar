export const mockRegions = [
	{
		key: '0x4dcb50595177a3177648411a42aca0f53dc63b0b76ffd6f80704a090da6f8719fd9bd0f1540b065ee2e9725610e019d965f904003d00ffffffffffffffffffff',
		value: {
			end: '331128',
			owner: 'DwnzPJAKmdYLMpxDTqG6FLXjRpnris2fB965GJpmvYbamuE',
			paid: '9440600837',
		},
	},
	{
		key: '0x4dcb50595177a3177648411a42aca0f53dc63b0b76ffd6f80704a090da6f8719fe1ad0b218654aa73d9b2ba13f09ed33c8f904003a00ffffffffffffffffffff',
		value: {
			end: '321048',
			owner: 'Evn32VbNCLXGvEu7WZnQ7jfV7X4dbN62iUnt3k89AJT4oJj',
			paid: '8060143865',
		},
	},
];

export const mockWorkloads = [
	{
		key: '95',
		value: { mask: '0xffffffffffffffffffff', assignment: { task: 2032 } },
	},
	{
		key: '20',
		value: { mask: '0xffffffffffffffffffff', assignment: { task: 2007 } },
	},
];

export const mockParasLifeCycles = [
	{
		key: '2007',
		value: 'Parathread',
	},
	{
		key: '2032',
		value: 'Parachain',
	},
];

export const mockCoreDescriptors = [
	{
		key: '10',
		value: {
			queue: null,
			currentWork: {
				assignments: [[{ task: 2007 }, { ratio: 57600, remaining: 57600 }]],
				endHint: null,
				pos: 1,
				step: 57600,
			},
		},
	},
	{
		key: '11',
		value: {
			queue: null,
			currentWork: {
				assignments: [[{ task: 2032 }, { ratio: 57600, remaining: 57600 }]],
				endHint: null,
				pos: 1,
				step: 57600,
			},
		},
	},
];

export const potentialRenewalsMocks = [
	{
		key: '0x4dcb50595177a3177648411a42aca0f5689a1593a634a1c1e2cd84ab4db3337ffc046620dd7b3b82380018e60400',
		value: {
			price: '55066361452',
			completion: {
				Complete: [{ mask: '0xffffffffffffffffffff', assignment: { Task: '2007' } }],
			},
		},
	},
	{
		key: '0x4dcb50595177a3177648411a42aca0f5689a1593a634a1c1e2cd84ab4db3337ff68f3245ca31bebd180028210500',
		value: {
			price: '76754134107',
			completion: {
				Complete: [{ mask: '0xffffffffffffffffffff', assignment: { Task: '2032' } }],
			},
		},
	},
];

export const mockLeases = [
	{
		task: '2007',
		until: '340200',
	},
	{
		task: '2032',
		until: '340200',
	},
];

export const mockReservations = [
	{
		mask: '0xffffffffffffffffffff',
		task: '1000',
	},
	{
		mask: '0xffffffffffffffffffff',
		task: '1001',
	},
	{
		mask: '0xffffffffffffffffffff',
		task: '1002',
	},
];

export const mockWorkplans = [
	{
		key: '0x4dcb50595177a3177648411a42aca0f5b20f0cdcf1dc08a3b45e596567ea076aefdd76257bb6014b780d05000800',
		value: [{ mask: '0xffffffffffffffffffff', assignment: { Task: '2032' } }],
	},
	{
		key: '0x4dcb50595177a3177648411a42aca0f5b20f0cdcf1dc08a3b45e596567ea076af9bf2a8f54b8466c780d05001800',
		value: [{ mask: '0xffffffffffffffffffff', assignment: { Task: '2007' } }],
	},
];
