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

import http from 'http';

export const request = (
	path: string,
	hostname: string,
	port: number
): Promise<string> => {
	return new Promise((resolve) => {
		http.get({ path, hostname, port }, (response) => {
			let data = '';
			response.on('data', (_data) => (data += _data));
			response.on('end', () => resolve(data));
		});
	});
};
