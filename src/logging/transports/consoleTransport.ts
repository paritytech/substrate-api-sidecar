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

import { format, transports } from 'winston';

import { SidecarConfig } from '../../SidecarConfig';
import { ITransformableInfo } from '../../types/logging';
import { filterApiRpc, nodeUtilFormat, stripAnsi, stripTimestamp, timeStamp } from '../transformers';

/**
 * Console transport for winston logger.
 */
export function consoleTransport(): transports.ConsoleTransportInstance {
	const {
		config: { LOG },
	} = SidecarConfig;
	/**
	 * A simple printing format for how `ITransformableInfo` shows up.
	 */
	const simplePrint = format.printf((info: ITransformableInfo) => {
		if (info?.stack) {
			// If there is a stack dump (e.g. error middleware), show that in console
			return `${info?.timestamp} ${info?.level}: ${info?.message} \n ${info?.stack}`;
		}

		return `${info?.timestamp} ${info?.level}: ${info?.message}`;
	});

	const transformers = [stripTimestamp(), nodeUtilFormat(), timeStamp];

	if (!LOG.JSON) {
		transformers.push(format.colorize(), simplePrint);
	} else {
		transformers.push(format.prettyPrint());
	}

	if (LOG.STRIP_ANSI) {
		transformers.unshift(stripAnsi());
	}

	if (LOG.FILTER_RPC) {
		transformers.unshift(filterApiRpc());
	}

	return new transports.Console({
		level: LOG.LEVEL || 'info',
		handleExceptions: true,
		format: format.combine(...transformers),
		// Silence using `jest --silent`
		silent: process.env.NODE_ENV === 'test',
	});
}
