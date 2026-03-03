import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

@Injectable()
export class PdfService {
  async generateAgreementHtml(data: any): Promise<string> {
    const { company, partners, revenueRules, agreement } = data;
    const date = new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });

    const partnersTable = partners.map((p: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.fullName}</td>
        <td>${p.share}%</td>
      </tr>
    `).join('');

    const revenueSection = revenueRules.map((rule: any) => `
      <div class="revenue-block">
        <h4>${rule.name} (${rule.type === 'PROJECT' ? 'Доходи з проєкту' : rule.type === 'CLIENTS' ? 'Доходи від клієнтів' : 'Чистий прибуток'})</h4>
        <table>
          <thead><tr><th>Партнер</th><th>Частка</th></tr></thead>
          <tbody>
            ${rule.shares.map((s: any) => `<tr><td>${s.partner.fullName}</td><td>${s.share}%</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `).join('');

    const signatureHtml = agreement?.signature
      ? `<div class="signature-section"><h3>Підписи сторін</h3><img src="${agreement.signature}" alt="Підпис" class="signature-img"/></div>`
      : '';

    return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Arial', sans-serif; color: #1a1a1a; margin: 0; padding: 40px; font-size: 14px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px solid #7B2FE8; padding-bottom: 24px; margin-bottom: 32px; }
    .logo-text { font-size: 28px; font-weight: 900; color: #7B2FE8; letter-spacing: -1px; }
    h1 { font-size: 22px; color: #1a1a1a; margin: 8px 0; }
    h2 { font-size: 16px; color: #7B2FE8; border-bottom: 1px solid #EAD8FF; padding-bottom: 6px; margin-top: 28px; }
    h3 { font-size: 14px; color: #1a1a1a; margin-top: 20px; }
    h4 { font-size: 13px; color: #555; margin: 12px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { background: #7B2FE8; color: white; padding: 8px 12px; text-align: left; font-size: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:nth-child(even) td { background: #F9F5FF; }
    .revenue-block { margin: 16px 0; padding: 16px; background: #F9F5FF; border-radius: 8px; border-left: 4px solid #7B2FE8; }
    .section { margin: 24px 0; }
    .date { color: #888; font-size: 13px; }
    .signature-section { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
    .signature-img { max-width: 300px; height: auto; border: 1px solid #ddd; padding: 8px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #7B2FE8; text-align: center; color: #999; font-size: 12px; }
    .badge { display: inline-block; background: #7B2FE8; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-text">HORAND Partnership</div>
    <h1>ДОГОВІР ПРО СПІВПРАЦЮ</h1>
    <p class="date">Дата: ${date}</p>
  </div>

  <div class="section">
    <h2>1. Загальні положення</h2>
    <p>Цей договір укладається між співвласниками ${company.type === 'COMPANY' ? 'компанії' : 'проєкту'} <strong>"${company.name}"</strong> з метою врегулювання відносин щодо управління, розподілу доходів та прийняття рішень.</p>
    <p>Тип: <strong>${company.type === 'COMPANY' ? 'Компанія' : 'Проєкт'}</strong><span class="badge">${company.type}</span></p>
  </div>

  <div class="section">
    <h2>2. Сторони договору (Співвласники)</h2>
    <table>
      <thead>
        <tr><th>№</th><th>Повне ім'я</th><th>Частка компанії</th></tr>
      </thead>
      <tbody>${partnersTable}</tbody>
    </table>
    <p>Сумарна частка: <strong>${partners.reduce((s: number, p: any) => s + p.share, 0)}%</strong></p>
  </div>

  <div class="section">
    <h2>3. Розподіл доходів</h2>
    <p>Сторони домовляються про наступні правила розподілу доходів:</p>
    ${revenueSection}
    <p><em>Примітка: суми часток за кожним правилом становлять 100%.</em></p>
  </div>

  <div class="section">
    <h2>4. Порядок прийняття рішень</h2>
    <p>Рішення приймаються шляхом голосування. Вага голосу кожного партнера пропорційна його частці в компанії.</p>
  </div>

  <div class="section">
    <h2>5. Зміна умов договору</h2>
    <p>Зміни до цього договору можуть вноситися лише за взаємною згодою всіх сторін та оформляються відповідним додатком.</p>
  </div>

  <div class="section">
    <h2>6. Термін дії</h2>
    <p>Договір набирає чинності з дати підписання та діє безстроково до моменту його розірвання за взаємною згодою сторін.</p>
  </div>

  ${signatureHtml}

  <div class="footer">
    <p>Документ сформовано автоматично системою HORAND Partnership &bull; ${date}</p>
  </div>
</body>
</html>`;
  }

  async generatePdf(html: string, filename: string): Promise<string> {
    const outputDir = join(process.cwd(), 'uploads', 'pdfs');
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    // Try puppeteer first, fallback to HTML file
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: 'new',
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfPath = join(outputDir, filename + '.pdf');
      await page.pdf({ 
        path: pdfPath, 
        format: 'A4', 
        printBackground: true, 
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      });
      await browser.close();
      return '/uploads/pdfs/' + filename + '.pdf';
    } catch (e) {
      console.warn('Puppeteer not available or failed, saving HTML fallback:', e);
      // Fallback: save HTML for printing
      const htmlPath = join(outputDir, filename + '.html');
      writeFileSync(htmlPath, html, 'utf-8');
      return '/uploads/pdfs/' + filename + '.html';
    }
  }
}
