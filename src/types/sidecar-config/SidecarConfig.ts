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
 * Object to house the values of all the configurable components for Sidecar.
 */
export interface ISidecarConfig {
	EXPRESS: ISidecarConfigExpress;
	SUBSTRATE: ISidecarConfigSubstrate;
	LOG: ISidecarConfigLog;
}

interface ISidecarConfigSubstrate {
	URL: string;
	TYPES_BUNDLE: string;
	TYPES_CHAIN: string;
	TYPES_SPEC: string;
	TYPES: string;
}

interface ISidecarConfigExpress {
	HOST: string;
	PORT: number;
	KEEP_ALIVE_TIMEOUT: number;
}

interface ISidecarConfigLog {
	LEVEL: string;
	JSON: boolean;
	FILTER_RPC: boolean;
	STRIP_ANSI: boolean;
	WRITE: boolean;
	WRITE_PATH: string;
	WRITE_MAX_FILE_SIZE: number;
	WRITE_MAX_FILES: number;
}
