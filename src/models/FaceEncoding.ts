import mercury from "@mercury-js/core";
export const FaceEncoding=mercury.createModel("FaceEncoding",{
    user:{
        type:"relationship",
        ref:"User"
    },
    encodingData:{
        type:"string",
        many:true
    },
    image:{
        type:"relationship",
        ref:"File"
    },
})