import mercury from "@mercury-js/core";
export const File=mercury.createModel("File",{
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    mimeType: {
      type: "string",
    },
    extension: {
      type: "string",
    },
    size: {
      type: "float",
    },
    url: {
      type: "string",
    },
    mediaId: {
      type: "string",
    },
    base64: {
      type: "string"
    }
})