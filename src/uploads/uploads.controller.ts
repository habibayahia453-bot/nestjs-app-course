import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Res,
  Get,
  Param
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import type { Express, Response } from "express";
import { ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FilesUploadDto } from "./dtos/files-upload.dto.js";

@Controller("api/uploads")
export class UploadsController {

  // POST: /api/uploads
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  public uploadfile(@UploadedFile() file: Express.Multer.File,) {
    if (!file) throw new BadRequestException("no file provided");

    console.log("file uploaded", { file });
    return { message: "file uploaded successfully" };
  }

// POST: /api/uploads/multiple-files
  @Post('multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: FilesUploadDto, description: 'uploading multiple images example'})
  public uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) throw new BadRequestException("no file provided");

    console.log("files uploaded", { files });
    return { message: "files uploaded successfully" };
  }  

  // GET: /api/uploads/:image
  @Get(":image")
  public showUploadedImage( 
    @Param("image") image: string,
    @Res() res: Response,
  ) {
    return res.sendFile(image, { root: "images" });
  }
}

