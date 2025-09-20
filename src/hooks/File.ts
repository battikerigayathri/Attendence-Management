import mercury from "@mercury-js/core";
import { Asset } from "../services/AssetService";

mercury.hook.before("CREATE_FILE_RECORD", async function (this) {
  try {
    const args = this?.options.args?.input || this?.options.args || this.data;
    if (!args) {
      throw new Error('No arguments provided to CREATE_FILE_RECORD hook');
    }

    if (!args.base64) {
      throw new Error('base64 field is required');
    }

    if (!args.name) {
      throw new Error('name field is required');
    }

    if (!args.extension) {
      throw new Error('extension field is required');
    }

    const asset = new Asset();
    const response = await asset.uploadFile(
      args.base64,
      args.name,
      args.extension
    );

    // Clear base64 and set the response data
    args.base64 = undefined;
    args.mediaId = response?.key;
    args.url = response?.path;
    args.mimeType = response?.mimeType;
    args.size = response?.size;

  } catch (error) {
    console.error('CREATE_FILE_RECORD hook error:', error);
    throw error;
  }
});

mercury.hook.before("DELETE_FILE_RECORD", async function (this) {
  try {
    const args = this?.options.args?.id || this?.record?.id;

    if (!args) {
      throw new Error('No ID provided to DELETE_FILE_RECORD hook');
    }

    const asset = new Asset();
    const file: any = await mercury.db.File.get({ _id: args }, this.user);
    
    if (file?.mediaId) {

      await asset.deleteFile(file.mediaId);

    } else {
      console.warn('No mediaId found for file, skipping asset deletion');
    }
  } catch (error) {
    console.error('DELETE_FILE_RECORD hook error:', error);
    throw error;
  }
});

mercury.hook.before("UPDATE_FILE_RECORD", async function (this) {
  try {
    let args: any = this?.options.args?.input || this?.data;
    

    if (!args) {
      throw new Error('No arguments provided to UPDATE_FILE_RECORD hook');
    }

    if (!Array.isArray(args)) {
      if (!args.id) {
        throw new Error('id field is required for file update');
      }

      if (args.base64) {
        if (!args.base64) {
          throw new Error('base64 field is required when updating file content');
        }

        const asset = new Asset();
        const file: any = await mercury.db.File.get({ _id: args.id }, this.user);
        
        if (!file) {
          throw new Error(`File with id ${args.id} not found`);
        }
        const response = await asset.updateFile(
          file?.mediaId,
          true,
          args.base64,
          args?.name || file?.name,
          args?.extension || file?.extension
        );

        args.base64 = undefined;
        args.mediaId = response?.key;
        args.url = response?.path;
        args.mimeType = response?.mimeType;
      }
    } else {
      const asset = new Asset();
      const updatePromises = args.map(async (arg: any, index: number) => {
        if (!arg.id) {
          throw new Error(`id field is required for file update at index ${index}`);
        }

        if (!arg.base64) {
          return { arg, response: null };
        }

        const file: any = await mercury.db.File.get({ _id: arg.id }, this.user);
        
        if (!file) {
          throw new Error(`File with id ${arg.id} not found at index ${index}`);
        }

        const response = await asset.updateFile(
          file?.mediaId,
          true,
          arg.base64,
          arg?.name || file?.name,
          arg?.extension || file?.extension
        );
        return { arg, response };
      });

      const results = await Promise.all(updatePromises);

      args = results.map(({ arg, response }) => ({
        ...arg,
        base64: undefined,
        mediaId: response?.key || arg.mediaId,
        url: response?.path || arg.url,
        mimeType: response?.mimeType || arg.mimeType,
      }));
      
      this.options.args.input = args;
    }
  } catch (error) {
    console.error('UPDATE_FILE_RECORD hook error:', error);
    throw error;
  }
});