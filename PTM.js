const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
var watermark = require('jimp-watermark');
const get = require('readline-sync');
const axios = require('axios');
var cron = require('node-cron');
const fs = require('fs');

puppeteer.use(StealthPlugin())

var datas = fs.readFileSync('list.txt', 'utf8');
bins = datas.split(/\r?\n/);

async function sendMessage(nama, filename) {
  const token = "1958136968:AAGce_CrlgP5mgufowUaRH4CPGcK6pge_48";
  var data = {
    'chat_id': '1085203595',
    'photo': `https://img.skuyy.my.id/${filename}.jpg`,
    'caption': `[${nama}] Absen Gagal!`,
  }
  await axios({
    method: 'post',
    url: `https://api.telegram.org/bot${token}/sendphoto`,
    data: data,
  })
  .then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log(err);
  })
}
async function sendPhoto(nama, filename) {
  const token = "1958136968:AAGce_CrlgP5mgufowUaRH4CPGcK6pge_48";
  var data = {
    'chat_id': '1085203595',
    'photo': `https://img.skuyy.my.id/${filename}.jpg`,
    'caption': `[${nama}] Absen Sukses!`,
  }
  await axios({
    method: 'post',
    url: `https://api.telegram.org/bot${token}/sendphoto`,
    data: data,
  })
  .then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log(err);
  })
}
async function absen() {
  console.log('\nAutomatic Absensi Online By BagusOk ')
  for (let takeBin of bins) {
    const data_fix = takeBin.split('|')
    const nama = data_fix[0];
    const email = data_fix[1];
    const password = data_fix[2];
    const noWa = data_fix[3];
    var filename = 'absen';

    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      slowMo: 0,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'

      ]})

    const page = await browser.newPage()
    const navigationPromise = page.waitForNavigation()

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36')
    await page.setViewport({
      width: 1366, height: 695
    })

    try {
      console.log(`\n[+] Memulai Login Google as ${email}`)
      await page.goto('https://sia.smknbandung.sch.id/login/')

      await navigationPromise

      await page.waitForSelector('#not_signed_in6voff9itxtgu')
      await page.click('#not_signed_in6voff9itxtgu')

      await navigationPromise

      await page.waitForSelector('#identifierId')
      await page.click('#identifierId')
      await page.type('#identifierId', email, {
        delay: 5
      })

      await page.waitForSelector('.qhFLie > #identifierNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .qIypjc > .VfPpkd-vQzf8d')
      await page.click('.qhFLie > #identifierNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .qIypjc > .VfPpkd-vQzf8d')

      await page.waitForTimeout(2000);

      await page.waitForSelector('#password input[type="password"]', {
        visible: true
      });
      await page.type('#password input[type="password"]', password, {
        delay: 5
      })

      await page.waitForSelector('.qhFLie > #passwordNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .qIypjc > .VfPpkd-RLmnJb')
      await page.click('.qhFLie > #passwordNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .qIypjc > .VfPpkd-RLmnJb')

      await navigationPromise
      await page.waitForTimeout(2000);

      await page.waitForSelector('body > .login-form > form > p > .btn-success')
      console.log('[+] Login Google Success')
      await page.click('body > .login-form > form > p > .btn-success')

      await page.waitForTimeout('5000')

      console.log('[+] Membuka https://sia.smknbandung.sch.id/siswa/?p=kbm&sub=presensi')
      await page.goto('https://sia.smknbandung.sch.id/siswa/?p=kbm&sub=presensi')

      console.log('[+] Waiting...')
      await navigationPromise
      await page.waitForTimeout('2000')

      try {
        // await page.click('#mdl_info_kbm > .modal-xl > .modal-content > .d-flex > .btn-primary');
        console.log('[+] Checking...')

        await page.waitForSelector('#jenis_kbm')
        await page.click('#jenis_kbm')
        console.log('[+] Memulai Absen Otomatis...')

        await page.select('#jenis_kbm', 'PTM')

        await page.waitForSelector('#hadir')
        await page.click('#hadir')

        await page.select('#hadir', '4')

        await page.waitForSelector('#sehat')
        await page.click('#sehat')

        await page.select('#sehat', '1')

        await page.waitForSelector('#suhu')
        await page.click('#suhu')
        await page.type('#suhu', '36')

        await page.waitForSelector('#cdyn_defaultbtn')
        await page.click('#cdyn_defaultbtn')

        await navigationPromise
        await page.waitForTimeout(2000);

        const abc = await page.screenshot({
          encoding: 'binary', type: 'jpeg', quality: 100,
        });
        if (!!abc) {
          fs.writeFileSync(`/var/www/html/${filename}.jpg`, abc);
        } else {
          throw Error('Unable to take screenshot');
        }

        await page.waitForSelector('.sidebar-mini > .swal2-container > .swal2-popup > .swal2-actions > .swal2-confirm')
        await page.click('.sidebar-mini > .swal2-container > .swal2-popup > .swal2-actions > .swal2-confirm')

        await navigationPromise
        await page.waitForTimeout(2000);

        await browser.close()
        console.log('[+] Absen Sukses!')

        await sendPhoto(nama, filename)

      }catch {
        const ss = await page.screenshot({
          encoding: 'binary', type: 'jpeg', quality: 100,
        });
        if (!!ss) {
          fs.writeFileSync(`/var/www/html/${filename}.jpg`, ss);
        } else {
          throw Error('Unable to take screenshot');
        }
        console.log('[+] Absen Telah Absen Sebelumnya atau ditutup')
        await browser.close()
        await sendMessage(nama, filename)
      }

    }catch {
      console.log('[+] Email atau Sandi Google Salah!');
      await browser.close()
    }
  }

}
const task = cron.schedule('0 7 * * 1-5', function() {
  absen();
});