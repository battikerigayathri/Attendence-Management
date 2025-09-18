import mercury from "@mercury-js/core";
export const Address=mercury.createModel("Address",{
    addressLine1:{
        type:"string"
    },
    addressLine2:{
        type:"string"
    },
    email:{
        type:"string"
    },
    city:{
        type:"string"
    },
    state:{
        type:"string"
    },
    country:{
        type:"string"
    },
    zipCode:{
        type:"number"
    },
    contactNumber:{
        type:"number"
    }
})