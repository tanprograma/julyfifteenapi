import mongoose from "mongoose";
export async function dbConnect(connectionURI) {
  try {
    const connection = await mongoose.connect(connectionURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,

      autoIndex: true,
    });
    console.log("connected to the db");
    return connection;
  } catch (error) {
    console.log("something funny happened");
  }
}
