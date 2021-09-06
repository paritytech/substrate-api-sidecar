import accountBalance1191 from './1191.json';
import accountBalance1000000 from './1000000.json';
import accountBalance4000000 from './4000000.json';
import accountBalance7245493 from './7245493.json';

export const westendAccountBalanceEndpoints = [
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=1191',
		JSON.stringify(accountBalance1191),
	], // v1
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=1000000',
		JSON.stringify(accountBalance1000000),
	], // v29
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=4000000',
		JSON.stringify(accountBalance4000000),
	], // v47
	[
		'/accounts/5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR/balance-info?at=7245493',
		JSON.stringify(accountBalance7245493),
	], // v9090
];
