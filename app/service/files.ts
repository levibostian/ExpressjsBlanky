import fs from "fs"
import path from "path"

export interface Files {
  doesExist(relativePath: string): boolean
  getAbsolute(relativePath: string): string
}

export class AppFiles implements Files {
  getAbsolute(relativePath: string): string {
    if (relativePath.startsWith("/")) {
      return relativePath
    }

    // We always include '..' in the path so that `relativePath` is *always* relative from the root `./app` directory.
    return path.join(__dirname, "..", relativePath)
  }

  doesExist(relativePath: string): boolean {
    const absoluteFilePath = this.getAbsolute(relativePath)

    return fs.existsSync(absoluteFilePath)
  }
}
