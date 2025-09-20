import mercury from "@mercury-js/core";
export const TrainingCentre= mercury.createModel("TrainingCentre",{
  centerId:{
    type:"number"
  },
  name:{
    type:"string"
  },
  description:{
    type:"string"
  },
  address:{
    type:"relationship",
    ref:"Address",
    many:true
  },
  isActive:{
    type:"boolean",
    default:"true"
  },
  admin:{
    type:"relationship",
    ref:"User",
    many:true
  }
})