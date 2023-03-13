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

/**
 * Names of config env vars of Sidecar.
 */
export enum CONFIG {
	BIND_HOST = 'BIND_HOST',
	PORT = 'PORT',
	KEEP_ALIVE_TIMEOUT = 'KEEP_ALIVE_TIMEOUT',
	URL = 'URL',
	LEVEL = 'LEVEL',
	JSON = 'JSON',
	FILTER_RPC = 'FILTER_RPC',
	STRIP_ANSI = 'STRIP_ANSI',
	TYPES_BUNDLE = 'TYPES_BUNDLE',
	TYPES_CHAIN = 'TYPES_CHAIN',
	TYPES_SPEC = 'TYPES_SPEC',
	TYPES = 'TYPES',
	WRITE = 'WRITE',
	WRITE_PATH = 'WRITE_PATH',
	WRITE_MAX_FILE_SIZE = 'WRITE_MAX_FILE_SIZE',
	WRITE_MAX_FILES = 'WRITE_MAX_FILES',
}
