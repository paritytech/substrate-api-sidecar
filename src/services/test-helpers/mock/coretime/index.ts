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

export const potentialRenewalsMocks = [
	{
		key: '0x4dcb50595177a3177648411a42aca0f5689a1593a634a1c1e2cd84ab4db3337ffc046620dd7b3b82380018e60400',
		value: {
			price: '55066361452',
			completion: {
				Complete: [{ mask: '0xffffffffffffffffffff', assignment: { Task: '2274' } }],
			},
		},
	},
	{
		key: '0x4dcb50595177a3177648411a42aca0f5689a1593a634a1c1e2cd84ab4db3337ff68f3245ca31bebd180028210500',
		value: {
			price: '76754134107',
			completion: {
				Complete: [{ mask: '0xffffffffffffffffffff', assignment: { Task: '2007' } }],
			},
		},
	},
];

export const mockLeases = [
	{
		task: '2000',
		until: '340200',
	},
	{
		task: '2084',
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
