// ---------------------------
//          Modules
// ---------------------------
import path from "path";
import config from "config";

// gRPC Modules
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

// Protocol Buffers Definition Files
import { ProtoGrpcType } from "../pb/services";
import { PostServiceHandlers } from "../pb/PostService";

// Utility Functions
import connectDB from "./utils/prisma";

// Controllers
import * as postController from "./controllers/post.controller";

// ---------------------------
//     Configuration Setup
// ---------------------------
// Proto Loader Options
const options: protoLoader.Options = {
  keepCase: true, // Preserve field casing instead of converting to camel case
  longs: String, // Deserialize long values as strings instead of objects
  enums: String, // Deserialize enum values as strings instead of numbers
  defaults: true, // Populate default values for missing fields
  oneofs: true, // Support "oneof" field in protobuf definitions
};

// Server Connection Parameters
const PORT = config.get<string>("port");
// Define the path to the .proto file containing the service definitions
const PROTO_FILE = "../proto/services.proto";

// ---------------------------
//        Proto Loading
// ---------------------------
// Load the .proto file synchronously with the specified options
const packageDef = protoLoader.loadSync(
  path.resolve(__dirname, PROTO_FILE),
  options
);

// Parse Loaded protocol buffers definition and cast it to ProtoGrpcType
const proto = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

// ---------------------------
//        gRPC Server
// ---------------------------
// Instantiate gRPC server
const server = new grpc.Server();

// Assign handlers to RPC methods
const serviceHandlers: PostServiceHandlers = {
  CreatePost: postController.createPostHandler,
  UpdatePost: postController.updatePostHandler,
  DeletePost: postController.deletePostHandler,
  GetPost: postController.findPostHandler,
  GetPosts: postController.findAllPostsHandler,
};

// Add services to server
server.addService(proto.PostService.service, serviceHandlers);

// ---------------------------
//      Server Binding
// ---------------------------
// Start the server and listen for requests
server.bindAsync(
  `0.0.0.0:${PORT}`, // Accept connections on all network interfaces
  grpc.ServerCredentials.createInsecure(), //! No SSL/TLS credentials, insecure
  (err, port) => {
    // Callback function to handle the result of bindAsync
    if (err) {
      console.error(err);
      return;
    }
    server.start(); // Start the server if binding succeeds
    connectDB(); // Connect to the database
    console.log(`? Server listening on ${port}`); // Log the listening port
  }
);
