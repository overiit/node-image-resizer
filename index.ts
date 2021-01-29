import express, { Response } from "express";
import { resize } from "./src/resize";

const app = express();

const PORT = process.env.PORT || 6401;

const getIPFSUrl = (IPFS_HASH: string) => {
  return `https://cloudflare-ipfs.com/ipfs/${IPFS_HASH}`;
};

const failResult = (res: Response, message = "An error occured") => {
  res.status(400).send({ success: false, message });
};

app.get("/resize", async (req, res) => {
  let { ipfs, size } = req.query;
  // check if ipfs hash provided
  if (!ipfs && typeof ipfs != "string") return failResult(res, "Missing ipfs");
  // check if size is valid
  if (!size && typeof size != "string") return failResult(res, "Missing size");
  let SIZE = parseInt(`${size}`);
  // check if invalid number
  if (`${SIZE}` === "NaN") return failResult(res, "Invalid Size");
  // Format to webp
  res.type(`image/webp`);
  // Resize & pipe
  resize(getIPFSUrl(`${ipfs}`), SIZE, res);
});

process.on("uncaughtException", (err) => {
  // Dont crash server on unexpected error
  if (err.message.startsWith("Gifsicle")) {
    console.log(`[GIF] Tried to handle as gif instead of png`);
  } else {
    //  Notify some place extern to get notified
    console.error(err);
  }
});

app.listen(PORT, () => {
  console.log(`🌟 Server started on http://localhost:${PORT}`);
});
