import Url from "../models/Url.js";
import generateCode from "../utils/generateCode.js";

const validateHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
};

export const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt } =
      req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "URL is required"
      });
    }

    const parsedUrl =
      validateHttpUrl(
        originalUrl.trim()
      );

    if (!parsedUrl) {
      return res.status(400).json({
        message:
          "Please enter a valid HTTP or HTTPS URL"
      });
    }

    let expirationDate = null;

    if (expiresAt) {
      expirationDate = new Date(expiresAt);

      if (
        isNaN(expirationDate.getTime())
      ) {
        return res.status(400).json({
          message: "Invalid expiration date"
        });
      }

      if (expirationDate <= new Date()) {
        return res.status(400).json({
          message:
            "Expiration time must be in the future"
        });
      }
    }

    let shortCode;

    while (true) {
      shortCode = generateCode();

      const exists = await Url.exists({
        shortCode
      });

      if (!exists) {
        break;
      }
    }

    const url = await Url.create({
      originalUrl:
        parsedUrl.toString(),
      shortCode,
      user: req.user.id,
      expiresAt: expirationDate
    });

    return res.status(201).json({
      message: "Short URL created",
      url
    });
  } catch (error) {
    console.error(
      "Create URL error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create URL"
    });
  }
};

export const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({
      user: req.user.id
    }).sort({
      createdAt: -1
    });

    return res.json(urls);
  } catch (error) {
    console.error(
      "Fetch URLs error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch URLs"
    });
  }
};

export const deleteUrl = async (req, res) => {
  try {
    const url =
      await Url.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

    if (!url) {
      return res.status(404).json({
        message: "URL not found"
      });
    }

    return res.json({
      message: "URL deleted"
    });
  } catch (error) {
    console.error(
      "Delete URL error:",
      error
    );

    return res.status(500).json({
      message: "Delete failed"
    });
  }
};

export const toggleUrl = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!url) {
      return res.status(404).json({
        message: "URL not found"
      });
    }

    if (
      url.expiresAt &&
      url.expiresAt <= new Date()
    ) {
      return res.status(400).json({
        message:
          "Expired URLs cannot be enabled"
      });
    }

    url.active = !url.active;

    await url.save();

    return res.json({
      message: url.active
        ? "URL enabled"
        : "URL disabled",
      active: url.active
    });
  } catch (error) {
    console.error(
      "Toggle URL error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update URL"
    });
  }
};

export const redirectUrl = async (
  req,
  res
) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code
    });

    if (!url) {
      return res.status(404).send(
        "Short URL not found"
      );
    }

    if (
      url.expiresAt &&
      url.expiresAt <= new Date()
    ) {
      return res.status(410).send(
        "Short URL expired"
      );
    }

    if (!url.active) {
      return res.status(410).send(
        "Short URL disabled"
      );
    }

    await Url.updateOne(
      {
        _id: url._id
      },
      {
        $inc: {
          clicks: 1
        },
        $push: {
          clickData: {
            timestamp: new Date(),
            ip: req.ip,
            userAgent:
              req.get("user-agent"),
            referrer:
              req.get("referer")
          }
        }
      }
    );

    return res.redirect(
      url.originalUrl
    );
  } catch (error) {
    console.error(
      "Redirect error:",
      error
    );

    return res.status(500).send(
      "Redirect failed"
    );
  }
};

export const getAnalytics = async (
  req,
  res
) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!url) {
      return res.status(404).json({
        message: "URL not found"
      });
    }

    const dailyClicks =
      await Url.aggregate([
        {
          $match: {
            _id: url._id
          }
        },
        {
          $unwind: "$clickData"
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$clickData.timestamp"
              }
            },
            clicks: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]);

    const topReferrers =
      await Url.aggregate([
        {
          $match: {
            _id: url._id
          }
        },
        {
          $unwind: "$clickData"
        },
        {
          $group: {
            _id: {
              $ifNull: [
                "$clickData.referrer",
                "Direct"
              ]
            },
            clicks: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            clicks: -1
          }
        },
        {
          $limit: 5
        }
      ]);

    return res.json({
      totalClicks: url.clicks,
      active: url.active,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      dailyClicks,
      topReferrers
    });
  } catch (error) {
    console.error(
      "Analytics error:",
      error
    );

    return res.status(500).json({
      message: "Analytics failed"
    });
  }
};