// requests library
const axios = require("axios");

// your choice of HTML parser
const cheerio = require("cheerio");
const jsdom = require("jsdom");

const express = require("express");
const {
  getQuotesData,
  getAuthors,
  processAuthorRequests,
} = require("./scrape-page.js");

const createService = () => {
  const app = express();

  app.get("/quotes", async (req, res) => {
    const consolidatedData = await getQuotesData(true);
    if (!consolidatedData) {
      throw new Error("No data found");
    }
    if (req.query.author) {
      const filteredData = consolidatedData.filter(
        (val) => val.author === req.query.author
      );
      res.status(200).json({ data: filteredData });
    } else if (req.query.tag) {
      const filteredData = consolidatedData.filter((val) =>
        val.tags.includes(req.query.tag)
      );
      res.status(200).json({ data: filteredData });
    } else {
      res.status(200).json({ data: consolidatedData });
    }
  });

  app.get("/authors", async (req, res) => {
    const authorName = req.query.name;

    if (Object.keys(req.query).length > 0) {
      if (authorName) {
        const authorDetails = await processAuthorRequests(authorName);
        const data = authorDetails ? [authorDetails] : [];
        res.status(200).json({ data });
      } else {
        res.status(200).json({ data: [] });
      }
    } else {
      const data = await getAuthors(true);
      res.status(200).json({ data });
    }
  });
  return app;
};

module.exports = { createService };
