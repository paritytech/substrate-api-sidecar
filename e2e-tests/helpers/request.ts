import http from 'http';

export const request = (
	path: string,
	hostname: string,
	port: number
): Promise<string> => {
	return new Promise((resolve) => {
		http.get({ path, hostname, port }, (response) => {
			let data = '';
			response.on('data', (_data) => (data += _data));
			response.on('end', () => resolve(data));
		});
	});
};
