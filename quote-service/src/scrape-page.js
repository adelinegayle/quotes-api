const cheerio = require("cheerio");
const axios = require("axios");

const SOURCE_URL = "http://quotes.toscrape.com/";

const fetchData = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

const scrapeAuthors = async (authors, url) => {
  const html = await fetchData(url);
  const $ = cheerio.load(html);
  $(".author").each(async (idx, el) => {
    const authName = $(el).text().trim();
    if (!authors.includes(authName)) {
      authors.push(authName);
    }
  });

  const nextPageLink = $(".next").find("a").attr("href");

  if (nextPageLink) {
    await scrapeAuthors(authors, SOURCE_URL + nextPageLink);
  }
  return authors;
};

const scrapeQuotes = async (data, url) => {
  const html = await fetchData(url);
  const $ = cheerio.load(html);

  let text, author;
  $(".quote").each((idx, elem) => {
    text = $(elem).find(".text").text().trim().slice(0, 50);
    author = $(elem).find(".author").text();
    // handling tags
    const tags = [];
    $(elem)
      .find(".tag")
      .each(function (i, e) {
        tags.push($(this).text());
      });

    data.push({ text, author, tags });
  });

  const nextPageLink = $(".next").find("a").attr("href");

  if (nextPageLink) {
    await scrapeQuotes(data, SOURCE_URL + nextPageLink);
  }
  return data;
};

const processAuthorRequests = async (authorName) => {
  const authUrl =
    SOURCE_URL +
    "author/" +
    normalizeStr(
      authorName.replace(/ /g, "-").replace(/\./g, "-").replace(/--/, "-")
    );
  return getSpecificAuthor(authUrl);
};

const normalizeStr = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getSpecificAuthor = async (url) => {
  const html = await fetchData(url);
  if (html) {
    const $ = cheerio.load(html);
    const name = $(".author-title").text();
    const biography = $(".author-description").text();
    const birthdate = $(".author-born-date").text();
    const location = $(".author-born-location").text();

    return name
      ? {
          name,
          biography: biography.trim().slice(0, 50),
          birthdate,
          location,
        }
      : "";
  }
  return {};
};

const getQuotesData = async (firstPageLoad) => {
  return scrapeQuotes([], SOURCE_URL);
};

const getAuthors = async (firstPageLoad) => {
  const authors = await scrapeAuthors([], SOURCE_URL);

  return Promise.all(authors.map((author) => processAuthorRequests(author)));
};

module.exports = {
  getQuotesData,
  getAuthors,
  getSpecificAuthor,
  processAuthorRequests,
};
