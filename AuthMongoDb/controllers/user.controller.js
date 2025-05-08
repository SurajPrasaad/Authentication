const userRegister = async (req,res)=>{

    //get data
    //validate data
    //check if already exists
    //create a user in database
    //create a verification token
    //save token in database
    //send token as email to user
    //send success status to user
     
    const {username,email,password} = req.body||{};

    console.log(req.body)

    console.log(username,email,password)
    if(!username ||!email||!password){
        return res.status(400).json({
            message:"All fields are required..."
        })
    }
    return res.send("Registered")
}

export {userRegister}