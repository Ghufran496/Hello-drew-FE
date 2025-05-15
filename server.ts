import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    console.log('📡 Next.js app preparing...');
    createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    }).listen(3000, () => {
        console.log('✅ Server ready on http://localhost:3000')
    })
}).catch(err => {
    console.error('❌ Error preparing Next.js app:', err);
}) 