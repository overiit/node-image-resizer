import request from "request";
import sharp from "sharp";
import { Readable } from "stream";

var Gifsicle = require("gifsicle-stream");

export const resize = async (url: string, size: number, res: any) => {
  // Fetch Image
  var responseStream = request.get(url);
  if (size > 1000) size = 1000;
  if (size < 50) size = 50;

  // Format response stream to buffer array
  var buffers: Buffer[] = [];
  await new Promise((resolve) => {
    responseStream.on("data", (buf: Buffer) => buffers.push(buf));
    responseStream.on("end", resolve);
  });
  // Create two read streams from buffer array
  // One for trying gif resize
  // One for resizing if gif resize fails (Every other format)
  var gifResizerReadStream = Readable.from(buffers);
  var sharpResizerReadStream = Readable.from(buffers);

  // Create gif processor
  const gifProcessor = new Gifsicle(
    size ? ["--resize-fit-height", size] : ["--resize-fit-width", size]
  );
  // resize as png
  let transform = sharp();
  transform.toFormat("webp");
  transform.resize({
    fit: "inside",
    height: size,
    width: size,
  });
  let sharpResizerWriteStream = sharpResizerReadStream.pipe(transform);

  // Handle gif processor failure
  gifProcessor.on("error", () => {
    // handle non gif
    sharpResizerWriteStream.pipe(res);
  });
  // try to pip gift processor
  gifResizerReadStream.pipe(gifProcessor).pipe(res);
};
