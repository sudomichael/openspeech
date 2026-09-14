import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://gizmoanalytics.io/**', (route) => route.fulfill({ body: '' }));
  await page.addInitScript(() => {
    Object.assign(window, { auditEvents: [] });
    window.gizmo = (name, properties) => { (window as unknown as {auditEvents: unknown[]}).auditEvents.push({ name, properties }); };
  });
});

test('model landing page has instant audio, comparisons, working copy, and signup success tracking', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('**/api/waitlist', async (route) => { expect(route.request().postDataJSON()).toEqual({ email: 'test@example.com', model: 'kokoro-82m' }); await route.fulfill({ json: { ok: true } }); });
  await page.goto('/models/kokoro-82m');
  await expect(page.getByRole('heading', { name: 'Hear Kokoro-82M' })).toBeVisible();
  await page.getByRole('button', { name: 'Play Neutral', exact: true }).first().click();
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('audio')].filter((a) => !a.paused).length)).toBe(1);
  await page.getByRole('button', { name: 'Copy instructions' }).first().click();
  await expect(page.getByRole('status').filter({hasText:'Copied'})).toBeVisible();
  await page.getByLabel('Email for launch updates').fill('test@example.com');
  await page.getByRole('button', { name: 'Join the Cloud waitlist' }).click();
  await expect(page.getByRole('status').filter({hasText:'You’re on the list'})).toBeVisible();
  const events = await page.evaluate(() => (window as unknown as {auditEvents:{name:string;properties:unknown}[]}).auditEvents);
  expect(events.some((e) => e.name === 'waitlist_signup')).toBeTruthy();
  expect(events.some((e) => e.name === 'sample_play')).toBeTruthy();
  expect(JSON.stringify(events)).not.toContain('test@example.com');
});

test('comparison stops cross-script playback and skips missing samples', async ({ page }) => {
  await page.goto('/compare?ids=piper,kokoro-82m,chatterbox');
  const playAll = page.getByRole('button', { name: 'Play all back-to-back' });
  await playAll.first().click();
  await expect(page.getByRole('button', { name: 'Pause Kokoro-82M neutral' })).toBeVisible();
  await page.getByRole('button', { name: 'Play Chatterbox emotional' }).click();
  await expect(page.getByRole('button', { name: 'Play Kokoro-82M neutral' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('audio')].filter((a) => !a.paused).length)).toBe(1);
  await page.getByRole('button', { name: 'Pause Chatterbox emotional' }).click();
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('audio')].filter((a) => !a.paused).length)).toBe(0);
});

test('custom comparison handles mixed success and quota errors without losing successful audio', async ({ page }) => {
  await page.route('**/api/generate', async (route) => {
    const data=route.request().postDataJSON();
    await route.fulfill(data.model==='kokoro-82m' ? {json:{id:'test',status:'succeeded',audio:'/samples/kokoro-82m/af_bella/neutral.wav'}} : {status:429,json:{error:'Daily capacity reached.'}});
  });
  await page.goto('/compare');
  await page.getByLabel('What should they say?').fill('A custom phrase for testing.');
  await page.getByRole('button',{name:'Generate & compare'}).click();
  await expect(page.getByText('Kokoro-82M: Ready to listen')).toBeVisible();
  await expect(page.getByText('Chatterbox Turbo: Daily capacity reached.')).toBeVisible();
  await page.getByRole('button',{name:'Play Kokoro-82M custom'}).click();
  await expect(page.getByRole('button',{name:'Pause Kokoro-82M custom'})).toBeVisible();
  const events=await page.evaluate(()=>(window as unknown as {auditEvents:unknown[]}).auditEvents);
  expect(JSON.stringify(events)).not.toContain('A custom phrase for testing.');
});

test('new models and model pages fit mobile and link to live Cloud',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/','/new-models','/models/xtts-v2','/compare']){
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
  await page.goto('/new-models');
  await expect(page.getByRole('heading',{name:'Chatterbox Turbo',exact:true})).toBeVisible();
  await expect(page.locator('a[href="https://app.openspeech.dev"]')).toBeVisible();
  await page.screenshot({path:'/tmp/openspeech-mobile-new-models.png',fullPage:true});
});
