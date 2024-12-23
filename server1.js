const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's dynamic port

const cors = require("cors");
app.use(cors());

console.log('Cache Path:', process.env.PUPPETEER_CACHE_DIR || 'Default path not set');

// Helper function to initialize Puppeteer
async function initializeBrowser() {
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}


// Ocado Scraper
async function scrapeOcado(url) {
  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let title = "N/A";
      try {
        title = await page.$eval("h1", (el) => el.textContent.trim());
      } catch (e) {
        console.warn("Main title not found:", e.message);
      }
    
    let price = "N/A";
      try {
        price = await page.$eval(".bop-price__current", (el) => el.textContent.trim());
      } catch (e) {
        console.warn("Price not found:", e.message);
      }

    let rating = "N/A";
      try {
        rating = await page.$eval('div.gn-rating meta[itemprop="ratingValue"]',(el) => el.getAttribute("content"));
      } catch (e) {
        console.warn("Rating not found:", e.message);
      }

    let votes = "N/A";
      try {
        votes = await page.$eval(".gn-rating__voteCount",(el) => el.textContent.trim().replace(/[()]/g, ""));
      } catch (e) {
        console.warn("Votes not found:", e.message);
      }

    await browser.close();
    return { website: "Ocado", title: title || "N/A", price: price || "N/A",rating: rating || "N/A",votes: votes || "N/A" };
  } catch (error) {
    return { error: "Error scraping Ocado: " + error.message };
  }
}

// Tesco Scraper
async function scrapeTesco(url) {
  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (["image", "stylesheet", "font"].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector('h1[data-auto="pdp-product-title"]', { timeout: 15000 });
    
    let title = "N/A";
    try {
        title = await page.$eval('h1[data-auto="pdp-product-title"]', (el) =>el.textContent.trim());
      } catch (e) {
        console.warn("Main title not found:", e.message);
      }   

    let price = "N/A";
    try {
        price = await page.$eval(".text__StyledText-sc-1jpzi8m-0.lmgzsH.ddsweb-text.styled__PriceText-sc-v0qv7n-1.eNIEDh",(el) => el.textContent.trim());
      } catch (e) {
        console.warn("Main price not found:", e.message);
      }

    let rating = "N/A";
      try {
        rating = await page.$eval('a[aria-label*="average rating"] > span.ddsweb-star-rating__average-rating-text',(el) => el.textContent.trim());
    } catch (e) {
        console.warn("Rating not found:", e.message);
    }

    let votes = "N/A";
      try {
        votes = await page.$eval('a[aria-label*="average rating"] > span.ddsweb-star-rating__ratings-count',(el) => el.textContent.replace(/[()]/g, '').trim());
    } catch (e) {
        console.warn("Votes not found:", e.message);
    }

    await browser.close();
    return { website: "Tesco", title: title || "N/A", price: price || "N/A",rating: rating || "N/A",votes: votes || "N/A"  };
  } catch (error) {
    return { error: "Error scraping Tesco: " + error.message };
  }
}

// Sainsbury's Scraper
async function scrapeSainsburys(url) {
  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector("h1[data-testid='pd-product-title']", { timeout: 15000 });

    let title = "N/A";
      try {
        title = await page.$eval("h1[data-testid='pd-product-title']",(el) => el.textContent.trim());
      } catch (e) {
        console.warn("Main title not found:", e.message);
      }
    
    let price = "N/A";
      try {
        price = await page.$eval("span[data-testid='pd-retail-price']",(el) => el.textContent.trim());
      } catch (e) {
        console.warn("Price not found:", e.message);
      }

    let rating = "N/A";
      try {
        rating = await page.$eval("div.pd__reviews div.ds-c-rating__stars",(el) => el.getAttribute("title").match(/(\d+\.\d+)/)?.[0] || "N/A");
      } catch (e) {
        console.warn("Rating not found:", e.message);
      }

    let votes = "N/A";
      try {
        votes = await page.$eval("button.star-rating-link span[data-testid='review-count']",(el) => el.textContent.match(/\d+/)?.[0] || "N/A");
      } catch (e) {
        console.warn("Votes not found:", e.message);
      }

    await browser.close();
    return { website: "Sainsbury", title: title || "N/A", price: price || "N/A",rating: rating || "N/A",votes: votes || "N/A"  };
  } catch (error) {
    return { error: "Error scraping Sainsbury: " + error.message };
  }
}

// Amazon Scraper
async function scrapeAmazon(url) {
  try {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let title = "N/A";
      try {
        title = await page.$eval("#productTitle", (el) =>el.textContent.trim());
      } catch (e) {
        console.warn("Main title not found:", e.message);
      }
    
    let price = "N/A";
      try {
        price = await page.$eval(".a-price[data-a-color='base'] .a-offscreen",(el) => el.textContent.trim());// Prioritize main price
      } catch (e) {
        console.warn("Price not found:", e.message);
      }

    let rating = "N/A";
      try {
        rating = await page.$eval("#averageCustomerReviews .a-size-base.a-color-base",(el) => el.textContent.trim());
      } catch (e) {
        console.warn("Rating not found:", e.message);
      }

    let votes = "N/A";
      try {
        votes = await page.$eval("#acrCustomerReviewText", (el) => {
          const text = el.textContent.trim();
          // Extract the numeric value and remove any commas
          const match = text.replace(/,/g, '').match(/\d+/); 
          return match ? match[0] : "N/A"; // Return only the number or "N/A" if not found
        });
      } catch (e) {
        console.warn("Votes not found:", e.message);
      }
    
    await browser.close();
    return { website: "Amazon", title: title || "N/A", price: price || "N/A",rating: rating || "N/A",votes: votes || "N/A"  };
  } catch (error) {
    return { error: "Error scraping Amazon: " + error.message };
  }
}

// Main endpoint to run all scrapers
app.get("/scrape", async (req, res) => {
  try {
    const results = await Promise.all([
      scrapeOcado("https://www.ocado.com/products/coca-cola-original-taste-26267011"),
      scrapeTesco("https://www.tesco.com/groceries/en-GB/products/273867627"),
      scrapeSainsburys(
        "https://www.sainsburys.co.uk/gol-ui/product/coca-cola-original-taste-24x330ml"
      ),
      scrapeAmazon("https://www.amazon.co.uk/dp/B07BBZ6NYS?ref=cm_sw_r_cp_ud_dp_0PDRADZSW14AREEBEMRN"),
    ]);

    res.status(200).json({
      message: "Scraping completed!",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ error: "Error in scraping: " + error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
