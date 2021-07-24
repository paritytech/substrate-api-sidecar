import { ArgumentParser } from 'argparse';
// import { version } from '../package.json'

export const parseArgs = () => {
    const parser = new ArgumentParser();

    parser.add_argument('-v', '--version', { action: 'store_true' });
    
    return parser.parse_args()
}
