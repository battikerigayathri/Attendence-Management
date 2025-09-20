import jwt from "jsonwebtoken";
import FormData from "form-data";
import fetch from "node-fetch";

export class Asset {
  authorization: string;
  BUCKET_NAME: string;
  API_KEY: string;
  APP_SECRET: string;
  FOLDER_NAME: string;
  ASSET_ENDPOINT: string;
  
  constructor() {
    this.authorization = this.getAuthorization();
  }
  
  getAuthorization() {
    this.API_KEY = process.env.MERCURY_ASSET_API_KEY!;
    this.BUCKET_NAME = process.env.MERCURY_ASSET_BUCKET_NAME!;
    this.APP_SECRET = process.env.MERCURY_ASSET_APP_SECRET!;
    this.ASSET_ENDPOINT = process.env.MERCURY_ASSET_ENDPOINT!;
    this.FOLDER_NAME = process.env.MERCURY_ASSET_FOLDER_NAME!;

    const token = jwt.sign(
      { eat: Math.floor(Date.now() / 1000) + 10 * 60 },
      this.APP_SECRET,
      {
        algorithm: "HS256",
      }
    );
    return token;
  }

  private validateBase64(base64: string): { mimeType: string; base64Data: string } {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Base64 data is required and must be a string');
    }

    if (!base64.includes(';base64,')) {
      throw new Error('Invalid base64 format. Expected format: data:mime/type;base64,data');
    }

    const base64Parts = base64.split(";base64,");
    if (base64Parts.length !== 2) {
      throw new Error('Invalid base64 format. Could not split on ";base64,"');
    }

    const mimeType = base64Parts[0]?.split(":")[1];
    const base64Data = base64Parts[1];

    if (!mimeType) {
      throw new Error('Could not extract MIME type from base64 string');
    }

    if (!base64Data) {
      throw new Error('Could not extract base64 data from string');
    }

    return { mimeType, base64Data };
  }

  private validateInputs(fileName: string, extension: string) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('fileName is required and must be a string');
    }
    if (!extension || typeof extension !== 'string') {
      throw new Error('extension is required and must be a string');
    }
  }
  
  async uploadFile(base64: string, fileName: string, extension: string) {
    try {
      // Validate inputs
      this.validateInputs(fileName, extension);
      const { mimeType, base64Data } = this.validateBase64(base64);

      const buffer = Buffer.from(base64Data, "base64");

      const formData = new FormData();
      formData.append("file", buffer, {
        filename: `${fileName}.${extension}`,
        contentType: mimeType,
      });
      formData.append("path", this.FOLDER_NAME);

      let response = await fetch(
        `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: this.authorization,
            "x-api-key": this.API_KEY,
            ...formData.getHeaders(),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      if (!responseData?.object?.key) {
        throw new Error('Invalid response: missing object.key');
      }

      let finalFileData = await this.generateSingedUrl(responseData.object.key);
      finalFileData.path = `${this.ASSET_ENDPOINT}${finalFileData?.path}`;
      finalFileData.size = responseData.object.size;
      finalFileData.mimeType = mimeType;
      return finalFileData;
    } catch (error) {
      throw error;
    }
  }
  
  async generateSingedUrl(key: string) {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key is required and must be a string');
      }

      const formData = new FormData();
      formData.append("key", key);
      formData.append("eat", "-1");

      const response = await fetch(
        `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/get-signed-url`,
        {
          method: "POST",
          headers: {
            Authorization: this.authorization,
            "x-api-key": this.API_KEY,
            ...formData.getHeaders(),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Signed URL error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Generate signed URL error:", error);
      throw error;
    }
  }
  
  async deleteFile(key: string) {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key is required and must be a string');
      }

      const response = await fetch(
        `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/file/${key}`,
        {
          method: "DELETE",
          headers: {
            Authorization: this.authorization,
            "x-api-key": this.API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Delete file error:", error);
      throw error;
    }
  }

  async updateFile(
    key: string,
    upsert = true,
    base64: string,
    fileName: string,
    extension: string
  ) {
    try {

      if (!key || typeof key !== 'string') {
        throw new Error('Key is required and must be a string');
      }

      // Validate inputs
      this.validateInputs(fileName, extension);
      const { mimeType, base64Data } = this.validateBase64(base64);

      const buffer = Buffer.from(base64Data, "base64");

      const formData = new FormData();
      formData.append("file", buffer, {
        filename: `${fileName}.${extension}`,
        contentType: mimeType,
      });
      formData.append("key", key);
      formData.append("upsert", String(upsert));

      let response = await fetch(
        `${this.ASSET_ENDPOINT}/${this.BUCKET_NAME}/file`,
        {
          method: "PUT",
          headers: {
            Authorization: this.authorization,
            "x-api-key": this.API_KEY,
            ...formData.getHeaders(),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      let finalFileData = await this.generateSingedUrl(key);
      finalFileData.path = `${this.ASSET_ENDPOINT}${finalFileData?.path}`;
      finalFileData.mimeType = mimeType;
      return finalFileData;
    } catch (error) {
      console.error("Update file error:", error);
      throw error;
    }
  }
}