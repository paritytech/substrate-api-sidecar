import { ConfigSpecs, SpecsFactory } from 'confmgr';

import { CONFIG, MODULES } from './types/sidecar-config';

const APPEND_SPEC_ERROR = 'Must create SpecFactory first.';

/**
 * Access a singleton specification for config enviroment variables that will
 * be initialized on first use.
 */
export class Specs {
	private static _specs: SpecsFactory | undefined;

	private static create(): SpecsFactory {
		this._specs = new SpecsFactory({ prefix: 'SAS' });
		this.appendLogSpecs();
		this.appendSubstrateSpecs();
		this.appendExpressSpecs();

		return this._specs;
	}

	/**
	 * Configurable enviroment variable specifications.
	 */
	static get specs(): ConfigSpecs {
		return this._specs?.getSpecs() || this.create().getSpecs();
	}

	/**
	 * EXPRESS module of the enviroment variable configuration specification.
	 */
	private static appendExpressSpecs() {
		if (!this._specs) {
			throw APPEND_SPEC_ERROR;
		}

		// HOST
		this._specs.appendSpec(
			MODULES.EXPRESS,
			this._specs.getSpec(
				CONFIG.BIND_HOST,
				'Network interface we bind to. You *MUST* use 0.0.0.0 if you are using Docker.',
				{
					default: '127.0.0.1',
					type: 'string',
				}
			)
		);

		// PORT
		this._specs.appendSpec(
			MODULES.EXPRESS,
			this._specs.getSpec(
				CONFIG.PORT,
				'Network interface we bind to. You *MUST* use 0.0.0.0 if you are using Docker.',
				{
					default: 8080,
					type: 'number',
					regexp: /^\d{2,6}$/,
				}
			)
		);
	}

	/**
	 * SUBSTRATE module of the enviroment variable configuration specification.
	 */
	private static appendSubstrateSpecs() {
		if (!this._specs) {
			throw APPEND_SPEC_ERROR;
		}

		// WS
		this._specs.appendSpec(
			MODULES.SUBSTRATE,
			this._specs.getSpec(CONFIG.WS_URL, 'Websocket URL', {
				default: 'wss://ws.sora2.soramitsu.co.jp',
				mandatory: true,
				regexp: /^wss?:\/\/.*(:\d{4,5})?$/,
			})
		);

		// TYPES_BUNDLE
		this._specs.appendSpec(
			MODULES.SUBSTRATE,
			this._specs.getSpec(
				CONFIG.TYPES_BUNDLE,
				'absolute path to file with `typesBundle` type definitions for @polkadot/api',
				{
					default: '',
					mandatory: false,
				}
			)
		);

		// TYPES_CHAIN
		this._specs.appendSpec(
			MODULES.SUBSTRATE,
			this._specs.getSpec(
				CONFIG.TYPES_CHAIN,
				'absolute path to file with `typesChain` type definitions for @polkadot/api',
				{
					default: '',
					mandatory: false,
				}
			)
		);

		// TYPES_SPEC
		this._specs.appendSpec(
			MODULES.SUBSTRATE,
			this._specs.getSpec(
				CONFIG.TYPES_SPEC,
				'absolute path to file with `typesSpec` type definitions for @polkadot/api',
				{
					default: '',
					mandatory: false,
				}
			)
		);
		this._specs.appendSpec(
			MODULES.SUBSTRATE,
			this._specs.getSpec(
				CONFIG.TYPES,
				'absolute path to file with `typesSpec` type definitions for @polkadot/api',
				{
					default: '',
					mandatory: false,
				}
			)
		);
	}

	/**
	 * LOG module of the enviroment variable configuration specification.
	 */
	private static appendLogSpecs() {
		if (!this._specs) {
			throw APPEND_SPEC_ERROR;
		}

		// LEVEL
		this._specs.appendSpec(
			MODULES.LOG,
			this._specs.getSpec(CONFIG.LEVEL, 'Log level', {
				default: 'info',
				regexp: /^error|warn|info|http|verbose|debug|silly$/,
			})
		);

		// JSON
		this._specs.appendSpec(
			MODULES.LOG,
			this._specs.getSpec(
				CONFIG.JSON,
				'Whether or not to format logs as JSON',
				{
					default: 'false',
					type: 'boolean',
					regexp: /^true|false$/,
				}
			)
		);

		// FILTER_RPC
		this._specs.appendSpec(
			MODULES.LOG,
			this._specs.getSpec(
				CONFIG.FILTER_RPC,
				'Wether or not filter out API-WS RPC logging',
				{
					default: 'false',
					type: 'boolean',
					regexp: /^true|false$/,
				}
			)
		);

		// STRIP_ANSI
		this._specs.appendSpec(
			MODULES.LOG,
			this._specs.getSpec(
				CONFIG.STRIP_ANSI,
				'Whether or not to strip ANSI characters',
				{
					default: 'false',
					type: 'boolean',
					regexp: /^true|false$/,
				}
			)
		);
	}
}
