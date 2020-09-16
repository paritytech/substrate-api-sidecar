import { ApiPromise } from '@polkadot/api';
import { Text, u32, Vec } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';
import { BlockHash } from '@polkadot/types/interfaces';

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
			const version = await api.rpc.state.getRuntimeVersion(hash);
			const blockSpecVersion = version.specVersion;
			const blockTxVersion = version.transactionVersion;

			// Swap metadata if tx version is different. This block of code should never execute, as
			// specVersion always increases when txVersion increases, but specVersion may increase
			// without an increase in txVersion. Defensive only.
			if (
				!this.txVersion.eq(blockTxVersion) &&
				this.specVersion.eq(blockSpecVersion)
			) {
				console.warn('txVersion bumped without specVersion bumping');
				this.txVersion = blockTxVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				api.registry.setMetadata(meta);
			}
			// Swap metadata and confirm txVersion if specVersion is different.
			else if (!this.specVersion.eq(blockSpecVersion)) {
				this.specVersion = blockSpecVersion;
				this.txVersion = blockTxVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				const chain = await api.rpc.system.chain();

				api.registry.register(
					getSpecTypes(
						api.registry,
						chain,
						version.specName,
						blockSpecVersion
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

	/**
	 * Process metadata documention.
	 *
	 * @param docs metadata doucumentation array
	 */
	protected sanitizeDocs(docs: Vec<Text>): string {
		return docs
			.map((l, idx, arr) =>
				idx === arr.length - 1 ? l.toString() : `${l.toString()}\n`
			)
			.join('');
	}
}
