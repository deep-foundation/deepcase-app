import http from 'http';
import request from 'request';

const server = http.createServer((req, res) => {
  const url = 'https://deep.deep.foundation/api/gql';
  const origin = req.headers.origin;

  req.pipe(request(url)).on('response', (response) => {
    response.headers['access-control-allow-origin'] = origin;
  }).pipe(res).on('error', (err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Error occurred while forwarding the request.');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Proxy server is listening on port ${port}`);
});
