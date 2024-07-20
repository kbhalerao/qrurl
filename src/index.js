/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
var QRCode = require('qrcode')

const htmlgen = (text, qrsvg, err="") => {
	return `<!DOCTYPE html>
			<body>
			${text}
			<div style="width: 2in">
			${qrsvg}
			</div>
			<div>${err}</div>
			</body>`;
}

export default {
	async fetch(request) {
		const url = new URL(request.url)
		const prefix = "?url="
		const req = url.search.replace(prefix, "")
		let result; 
		try {
			result = await QRCode.toString(req)
		} catch (err) {
			const example = 'https://example.com'; 
			result = await QRCode.toString(example)
			const html = htmlgen(`Try these examples: 
			<a href='${url.origin}/?url=${example}'>html</a>
			<strong>or</strong> 
			<a href='${url.origin}/api/?url=${example}'>api</a>`, result, err);
			return new Response(html, {
				headers: { "content-type": "text/html;charset=UTF-8" }
			});
		}

		if (url.pathname === '/api/') {
			return new Response(JSON.stringify({url:req, qr: result}), {
				headers: { "content-type": "application/json" }
			})
		} else {
			const html = htmlgen(req, result);
			return new Response(html, {
				headers: { "content-type": "text/html;charset=UTF-8" }
			});
		}
	},
};
