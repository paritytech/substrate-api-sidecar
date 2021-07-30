import { ArgumentParser, Namespace } from 'argparse';

export const parseArgs = (): Namespace => {
	const parser = new ArgumentParser();

	parser.add_argument('-v', '--version', { action: 'store_true' });

	return parser.parse_args() as Namespace;
};
