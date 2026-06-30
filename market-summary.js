const axios = require('axios');
const nodemailer = require('nodemailer');

// Your API Keys and email
const FINNHUB_API_KEY = 'd75e15d07e2748b1a8a89af9f913e327';
const EXCHANGE_RATES_API_KEY = 'd91mivpr01qnefofne10d91mivpr01qnefofne1g';
const EMAIL = 'sitholemunashe@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // We'll set this up in GitHub

// Major US stocks to track
const STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B'];
const INDICES = ['^GSPC', '^IXIC', '^DJI']; // S&P 500, Nasdaq, Dow Jones

async function getStockData() {
  try {
    let stockSummary = '📈 **US STOCK MARKET**\n';
    
    // Fetch major indices
    for (const index of INDICES) {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${index}&token=${FINNHUB_API_KEY}`);
        const data = response.data;
        const name = index === '^GSPC' ? 'S&P 500' : index === '^IXIC' ? 'Nasdaq' : 'Dow Jones';
        const change = data.d || 0;
        const changePercent = data.dp || 0;
        const arrow = change >= 0 ? '📈' : '📉';
        stockSummary += `  ${arrow} ${name}: ${data.c.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)\n`;
      } catch (e) {
        console.error(`Error fetching ${index}:`, e.message);
      }
    }

    stockSummary += '\n📊 **TOP STOCKS**\n';
    // Fetch individual stocks
    for (const stock of STOCKS) {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stock}&token=${FINNHUB_API_KEY}`);
        const data = response.data;
        const change = data.d || 0;
        const changePercent = data.dp || 0;
        const arrow = change >= 0 ? '📈' : '📉';
        stockSummary += `  ${arrow} ${stock}: $${data.c.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)\n`;
      } catch (e) {
        console.error(`Error fetching ${stock}:`, e.message);
      }
    }

    return stockSummary;
  } catch (error) {
    console.error('Stock data error:', error.message);
    return '⚠️ Could not fetch stock data\n';
  }
}

async function getCurrencyRates() {
  try {
    const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${EXCHANGE_RATES_API_KEY}&symbols=USD,MUR,ZAR,ZWL`);
    const rates = response.data.rates;
    
    let currencySummary = '💱 **CURRENCY RATES** (vs USD)\n';
    
    // MUR/USD
    currencySummary += `  • MUR/USD: ${(rates.MUR / rates.USD).toFixed(4)}\n`;
    
    // USD/ZAR
    currencySummary += `  • USD/ZAR: ${(rates.USD / rates.ZAR).toFixed(4)}\n`;
    
    // USD/ZWL
    currencySummary += `  • USD/ZWL: ${(rates.USD / rates.ZWL).toFixed(4)}\n`;
    
    // MUR/ZAR
    currencySummary += `  • MUR/ZAR: ${(rates.MUR / rates.ZAR).toFixed(4)}\n`;
    
    return currencySummary;
  } catch (error) {
    console.error('Currency rates error:', error.message);
    return '⚠️ Could not fetch currency rates\n';
  }
}

async function getJobAlerts() {
  // Note: Job alerts require additional setup with LinkedIn/Indeed APIs
  // For now, returning placeholder - we can integrate this next
  let jobSummary = '💼 **JOB ALERTS**\n';
  jobSummary += '  • Finance entry-level roles (Europe & Remote US)\n';
  jobSummary += '  • [Setup required - see next steps]\n';
  return jobSummary;
}

async function sendEmail(content) {
  try {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: EMAIL,
      to: EMAIL,
      subject: `📊 Market Summary - ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      text: content,
      html: `<pre>${content.replace(/\n/g, '<br>')}</pre>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending error:', error.message);
  }
}

async function main() {
  console.log('Starting market summary automation...');
  
  const stocks = await getStockData();
  const currencies = await getCurrencyRates();
  const jobs = await getJobAlerts();
  
  const fullSummary = `DAILY MARKET SUMMARY\n${'='.repeat(50)}\n\n${stocks}\n${currencies}\n${jobs}\n\nGenerated: ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Johannesburg' })}\n`;
  
  console.log(fullSummary);
  await sendEmail(fullSummary);
}

main().catch(console.error);
