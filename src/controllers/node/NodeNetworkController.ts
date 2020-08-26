import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';

import { NodeNetworkService } from '../../services';
import AbstractController from '../AbstractController';

/**
 * GET information about the Substrate node's activity in the peer-to-peer network.
 *
 * Returns:
 * - `nodeRoles`: Roles the node is running.
 * - `numPeers`: Number of peers the node is connected to.
 * - `isSyncing`: Whether or not the node is syncing. `False` indicates that the
 * 		node is in sync.
 * - `shouldHavePeers`: Whether or not the node should be connected to peers. Might
 * 		be false for local chains or when running without discovery.
 * - `localPeerId`: Local copy of the `PeerId`.
 * - `localListenAddresses`: Multiaddresses that the local node is listening on.
 * 		The addresses include a trailing `/p2p/` with the local PeerId, and are thus
 * 		suitable to be passed to `system_addReservedPeer` or as a bootnode address
 * 		for example.
 * - `systemPeers`: array of
 * 		- `peerId`: Peer ID.
 *		- `roles`: Roles the peer is running.
 *		- `protocolVersion`: Peer's protocol version.
 *		- `bestHash`: Hash of the best block on the peers canon chain.
 *		- `bestNumber`: Height of the best block on the peers canon chain.
 *
 * References:
 * - `NodeRole`: https://github.com/paritytech/substrate/blob/master/client/rpc-api/src/system/helpers.rs#L80
 */
export default class NodeNetworkController extends AbstractController<
	NodeNetworkService
> {
	constructor(api: ApiPromise) {
		super(api, '/node/network', new NodeNetworkService(api));
		this.initRoutes();
	}

	protected initRoutes(): void {
		this.safeMountAsyncGetHandlers([['', this.getNodeNetworking]]);
	}

	/**
	 * GET information about the Substrate node's activity in the peer-to-peer network.
	 *
	 * @param _req Express Request
	 * @param res Express Response
	 */
	private getNodeNetworking: RequestHandler = async (
		_req,
		res
	): Promise<void> => {
		NodeNetworkController.sanitizedSend(
			res,
			await this.service.fetchNetwork()
		);
	};
}
