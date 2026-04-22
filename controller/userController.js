

//import the prisma client from db.config.js

const prisma = require("../db/db.config.js");



//create user controller

exports.createUser = async(req,res)=>{
    try{
        
        const {name,email,password,role}=req.body;

        //check the basic validation is name email and password is empty or not

        if(!name || !email || !password){
            return res.status(400).json({
                message: "Name, email and password are required",
                success: false
            })
        }

        //validate the role
        const allowedRoles = ["ADMIN","USER","MODERATOR"];

        if(role && !allowedRoles.includes(role)){
            return res.status(400).json({
                message: "Invalid role. Allowed roles are ADMIN, USER, MODERATOR",
                success: false
            })
        }

        //check if email already exists or not
        const existingEmail = await prisma.user.findUnique({
            where:{
                email:email
            }
        })

        if(existingEmail){
            return res.status(400).json({
                message: "Email already exists",
                success: false
            })
        }

        //create user
        const newUser = await prisma.user.create({
            data:{
                name:name,
                email:email,
                password:password,
                role: role || "USER"
            },
            //select only the required fields to return in response
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                createdAt:true
            }
        })

        //success response
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser
        })
    }catch(error){

        //this will chekc duplicate field value error like even if we check before for email already exist of not but if two request come at same time with same email then this error will handle that case
       if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Duplicate field value"
      });
    }

    // ------------------------------
    // 7. General error
    // ------------------------------
    console.error("Create User Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
    }
