const { describe, it, expect, test } = require('@jest/globals');
const puppeteer = require("puppeteer");
jest.setTimeout(10000); 

const checkSystemStatus = async (deeplinksUrl) => {
  let status;
  let err;
  try {
    // DL may be not in docker, when DC in docker, so we use host.docker.internal instead of docker-network link deep_links_1
    status = await axios.post(`${deeplinksUrl}/gql`, { "query": "{ healthz { status } }" }, { validateStatus: status => true, timeout: 7000 });
  } catch(e){
    err = e;
  }
  console.log('system status', JSON.stringify(status?.data));
  return { result: status?.data?.data?.healthz?.[0].status, error: err };
};

const initLocalDeep = async ({
  browser,
  page
}) => {
  await page.goto('http://localhost:3007', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#startInitLocal');
  await page.click('button[id=startInitLocal]');

  let count = 0;
  const intervalId = setInterval(
    async (url) => {
      count++;
      const status = await checkSystemStatus(url);
      if (status.result !== undefined || count > 200) clearInterval(intervalId)
    },
    1000,
    `localhost:3006`
  );
  await browser.close();
  return { status: count>200 ? 'timeout' : 'ok'};
}

describe('build tests', () => {
  it(`init local Deep`, async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const initResule = await initLocalDeep({
      browser,
      page
    });
    expect(initResule.status === 'ok');
  });
});