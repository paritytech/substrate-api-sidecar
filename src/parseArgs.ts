// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { ArgumentParser, Namespace } from 'argparse';

export const parseArgs = (): Namespace => {
	const parser = new ArgumentParser();

	parser.add_argument('-v', '--version', {
		action: 'store_true',
		help: 'print substrate-api-sidecar version',
	});
	parser.add_argument('-p', '--prometheus', {
		action: 'store_true',
		help: 'enable the prometheus metrics endpoint',
	});
	parser.add_argument('-pp', '--prometheus-port', {
		type: 'int',
		default: 9100,
		help: 'specify the port number on which the prometheus metrics are exposed [default: 9100]',
	});

	return parser.parse_args() as Namespace;
};
