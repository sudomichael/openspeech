import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});
for(const path of ['/','/new-models','/models/xtts-v2','/compare']){
 await page.goto(`http://localhost:3107${path}`);
 console.log(path,await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0}).slice(0,12).map(el=>({tag:el.tagName,class:el.className,text:el.textContent?.slice(0,60),right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width}))})));
 await page.screenshot({path:`/tmp/openspeech-${path.replaceAll('/','-')||'home'}.png`});
}
await browser.close();
