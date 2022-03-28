import accountBalance20000 from './20000.json';
import accountBalance198702 from './198702.json';
import accountBalance2282256 from './2282256.json';
import accountBalance3574738 from './3574738.json';
import accountBalance4574738 from './4574738.json';
import accountBalance6574738 from './6574738.json';
import accountBalance7241122 from './7241122.json';
import accountBalance8000000 from './8000000.json';
import accountBalance8320000 from './8320000.json';
import accountBalance8500000 from './8500000.json';
import accountBalance9000000 from './9000000.json';
import accountBalance9500000 from './9500000.json';

export const polkadotAccountBalanceEndpoints = [
	[
		'/accounts/1KvKReVmUiTc2LW2a4qyHsaJJ9eE9LRsywZkMk5hyBeyHgw/balance-info?at=20000',
		JSON.stringify(accountBalance20000),
	], // v0
	[
		'/accounts/1KvKReVmUiTc2LW2a4qyHsaJJ9eE9LRsywZkMk5hyBeyHgw/balance-info?at=198702',
		JSON.stringify(accountBalance198702),
	], // v5
	[
		'/accounts/14Kq2Gt4buLr8XgRQmLtbWLHkejmhvGhiZDqLEzWcbe7jQTU/balance-info?at=2282256',
		JSON.stringify(accountBalance2282256),
	], // v25
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=3574738',
		JSON.stringify(accountBalance3574738),
	], // v26
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=4574738',
		JSON.stringify(accountBalance4574738),
	], // v29
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=6574738',
		JSON.stringify(accountBalance6574738),
	], // v9080
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=7241122',
		JSON.stringify(accountBalance7241122),
	], // v9110
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8000000',
		JSON.stringify(accountBalance8000000),
	], // v9122
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8320000',
		JSON.stringify(accountBalance8320000),
	], // v9130
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8500000',
		JSON.stringify(accountBalance8500000),
	], // v9140
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=9000000',
		JSON.stringify(accountBalance9000000),
	], // v9151
	[
		'/accounts/15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=9500000',
		JSON.stringify(accountBalance9500000)
	], // v9170
];
