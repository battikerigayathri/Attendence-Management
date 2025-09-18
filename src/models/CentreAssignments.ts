import mercury from "@mercury-js/core"; 
export const AssignedCentre=mercury.createModel("AssignedCentre",{
    user:{
        type:"relationship",
        ref:"User"
    },
    trainingCentre:{
        type:"relationship",
        ref:"TrainingCentre",
        many:true
    },
    role:{
        type:"enum",
        enumType:"string",
        enum:["COACH","PLAYER"]
    },
    assignedBy:{
        type:"relationship",
        ref:"User"
    },
    isActive:{
        type:"boolean"
    }
}
)