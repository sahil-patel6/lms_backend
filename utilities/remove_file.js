const admin = require("../firebase_admin");

exports.removeFile = async (path) => {
  // unlink(`${__dirname}/../public${path}`,(err)=>{
  //     if (err){
  //         console.log(err);
  //     }else{
  //         console.log("Successfully deleted:",path)
  //     }
  // })
  try {
    const file = await admin.storage().bucket().file(path);
    await file.delete();
    console.log("Successfully deleted:",path)
} catch (error) {
    console.log(error);
  }
};
