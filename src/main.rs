use substrate_api_client::{Api, node_metadata};
use primitives::sr25519;

fn main() {
    // instantiate an Api that connects to the given address
    let url = "127.0.0.1:9944";
    // if no signer is set in the whole program, we need to give to Api a specific type instead of an associated type
    // as during compilation the type needs to be defined.
    let api = Api::<sr25519::Pair>::new(format!("ws://{}", url));

    let meta = api.get_metadata();
    println!("Metadata:\n {}", node_metadata::pretty_format(&meta).unwrap());
}