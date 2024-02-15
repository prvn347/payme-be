const  z = require("zod")

const userValidate = z.object({
    
	username:z.string().email(),
firstName: z.string(),
lastName: z.string(),
password: z.string(z.number().min(6))})

const userSignIn = z.object({
    username:z.string().email(),
    password:z.string(z.number().min(6))})



module.exports={
    userValidate,
    userSignIn
}