import { HasuraApi } from '@deep-foundation/hasura/api.js';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import {describe, it, expect, test} from '@jest/globals';
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { delay } from "@deep-foundation/deeplinks/imports/promise";
import puppeteer from "puppeteer";

const DEEPLINKS_HASURA_PATH = process.env.DEEPLINKS_HASURA_PATH || '';
const DEEPLINKS_HASURA_SSL = process.env.DEEPLINKS_HASURA_SSL || '';
const DEEPLINKS_HASURA_SECRET = process.env.DEEPLINKS_HASURA_SECRET || '';

export const api = new HasuraApi({
  path: DEEPLINKS_HASURA_PATH,
  ssl: !!+DEEPLINKS_HASURA_SSL,
  secret: DEEPLINKS_HASURA_SECRET,
});

const apolloClient = generateApolloClient({
  path: `${DEEPLINKS_HASURA_PATH}/v1/graphql`,
  ssl: !!+DEEPLINKS_HASURA_SSL,
  secret: DEEPLINKS_HASURA_SECRET,
});

const deep = new DeepClient({ apolloClient });

const initLocalDeep = async ({
  browser,
  page
}) => {
  await page.goto('localhost:3007', { waitUntil: 'networkidle2' });
  await page.waitFor('#startInitLocal');
  await page.type('#pan', process.env.PAYMENT_TEST_CARD_NUMBER_SUCCESS); // card number
  await page.click('button[type=submit]'); // submit button
  await page.waitFor('button[tuibutton][class=full]'); // back button
  await browser.close();

}

describe('bool_exp', () => {
  describe('value convertation', () => {
    it(`insert separately`, async () => {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await initLocalDeep({
        browser,
        page
      });

    });
  });
});