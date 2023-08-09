import express from "express";
import Content from "../Models/ContentModel.js";
import { isAuth } from "../utils.js";
import expressAsyncHandler from "express-async-handler";

export const contentRouter = express.Router();
const PAGE_SIZE = 10;

//! Endpoints!
//todo:@

contentRouter.get(
  "/",
//   isAuth,
  expressAsyncHandler(async (req, res) => {
    const content = await Content.find();
    res.send(content);
  })
);

contentRouter.get(
  "/id/:id",
  //   isAuth,
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
    console.log("search end point");
    const { query } = req;
    const pageSize = PAGE_SIZE;
    const page = query.page || 1;
    const searchQuery = query.query || "";

    const queryFilter = searchQuery
      ? { title: { $regex: searchQuery, $options: "i" } }
      : {};
    const contents = await Content.find({
      ...queryFilter,
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const countContent = await Content.countDocuments({
      ...queryFilter,
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
