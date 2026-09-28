import mongoose from "mongoose";
export async function dbConnect(connectionURI) {
	try {
		const connection = await mongoose.connect(connectionURI);
		console.log("connected to the db");
		return connection;
	} catch (error) {
		const myError = new Error(error);
		console.log(myError.message);
		console.log("something funny happened");
	}
}
