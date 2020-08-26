import { ApiPromise } from '@polkadot/api';
import { u32 } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';
import { BlockHash } from '@polkadot/types/interfaces';

import Config, { ParentVersion } from '../Config';

export abstract class AbstractService {
	private readonly versionReset = 99999999;
	private specVersion: u32;
	private txVersion: u32;

	constructor(protected api: ApiPromise) {
		this.specVersion = api.createType('u32', this.versionReset);
		this.txVersion = api.createType('u32', this.versionReset);
	}

	protected async ensureMeta(hash: BlockHash): Promise<ApiPromise> {
		const { api } = this;

		try {
			let checkVersion;
			if (
				Config.PARENT_VERSION === ParentVersion.on ||
				(Config.UPGRADE_BLOCKS && hash.toHex() in Config.UPGRADE_BLOCKS)
			) {
				// Get the version info for the previous block if this block has a call to `set_code`.
				// Blocks with `set_code` have the version of the new runtime code, but the extrinsics within
				// (normally there are none since set_code takes up the whole block) are executed with the
				// runtime code of the previous block. Here we fetch the runtime version of the previous block.
				// The block numbers are hardcoded because otherwise we would face the time penalty on every
				// call that uses `ensureMeta`
				const { parentHash } = await this.api.rpc.chain.getHeader(hash);
				checkVersion = await api.rpc.state.getRuntimeVersion(
					parentHash
				);
			} else {
				checkVersion = await api.rpc.state.getRuntimeVersion(hash);
			}

			const { specVersion, transactionVersion } = checkVersion;

			if (
				!this.txVersion.eq(transactionVersion) &&
				this.specVersion.eq(specVersion)
			) {
				// Swap metadata if tx version is different. This block of code should never execute, as
				// specVersion always increases when txVersion increases, but specVersion may increase
				// without an increase in txVersion. Defensive only.
				console.warn('txVersion bumped without specVersion bumping');
				this.txVersion = transactionVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				api.registry.setMetadata(meta);
			}
			// Swap metadata and confirm txVersion if specVersion is different.
			else if (!this.specVersion.eq(specVersion)) {
				this.specVersion = specVersion;
				this.txVersion = transactionVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				const chain = await api.rpc.system.chain();

				api.registry.register(
					getSpecTypes(
						api.registry,
						chain,
						checkVersion.specName,
						specVersion
					)
				);
				api.registry.setMetadata(meta);
			}
		} catch (err) {
			console.error(
				`Failed to get Metadata for block ${hash.toString()}, using latest.`
			);
			console.error(err);
			this.specVersion = api.createType('u32', this.versionReset);
			this.txVersion = api.createType('u32', this.versionReset);
		}

		return api;
	}
}
