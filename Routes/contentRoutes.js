import express from "express";
import Content from "../Models/ContentModel.js";
import FeaturedContent from "../Models/FeaturedContentModel.js";
import { isAuth } from "../utils.js";
import expressAsyncHandler from "express-async-handler";

export const contentRouter = express.Router();
const PAGE_SIZE = 10;

//! Endpoints!
//todo:@

contentRouter.get(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const content = await Content.find();
    res.send(content);
  })
);

contentRouter.get(
  "/id/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    //! no need to try catch thanks for express async handler
    const { id } = req.params;
    console.log(id);
    const content = await Content.findById(id);
    content
      ? res.send(content)
      : res.status(404).send({ message: "Not Found" });
  })
);

contentRouter.get(
  "/search",
  // isAuth,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = PAGE_SIZE;
    const page = query.page || 1;
    const searchQuery = query.query || "";
    const genre = query.genre || "";

    const queryFilter = searchQuery
      ? { title: { $regex: searchQuery, $options: "i" } }
      : {};
    const genreFilter = genre && genre !== "all" ? { genre } : {};
    const contents = await Content.find({
      ...queryFilter,
      ...genreFilter,
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const countContent = await Content.countDocuments({
      ...queryFilter,
      ...genreFilter,
    });
    console.log(countContent);
    res.send({
      contents,
      page,
      countContent: countContent,
      pages: Math.ceil(countContent / pageSize),
    });
  })
);

contentRouter.get(
  "/random",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // const content = await Content.aggregate([{ $sample: { size: 1 } }]);
    // return res.status(200).send(content[0]);
    const content = await Content.findById("64ddc3a0fd9cd0860359a4d3");
    return res.status(200).send(content);
  })
);

contentRouter.get(
  "/movie",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const content = await Content.aggregate([{ $match: { isSeries: false } } ,{ $sample: { size: 1 } }]);
    return res.status(200).send(content[0]);
  })
);

contentRouter.get(
  "/series",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const content = await Content.aggregate([{ $match: { isSeries: true } } ,{ $sample: { size: 1 } } ]);
    return res.status(200).send(content[0]);
  })
);

contentRouter.get(
  "/featured",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const featuredContent = await FeaturedContent.find()
      .populate("contentList")
      .exec();
    return res.status(200).send(featuredContent);
  })
);

contentRouter.get(
  "/featured/movie",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const featuredContent = await FeaturedContent.find({type: "movie"})
      .populate("contentList")
      .exec();
    return res.status(200).send(featuredContent);
  })
);
contentRouter.get(
  "/featured/series",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const featuredContent = await FeaturedContent.find({type: "series"})
      .populate("contentList")
      .exec();
    return res.status(200).send(featuredContent);
  })
);
